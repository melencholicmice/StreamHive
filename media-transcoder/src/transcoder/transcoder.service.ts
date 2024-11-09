import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import Docker from 'dockerode';
import config from 'src/config/configuration';
import { Readable } from 'stream';

@Injectable()
export class TranscoderService {
    private docker: Docker;
    private s3Client: S3Client;

    private resolutions = [
        { resolution: '720p', width: 1280, height: 720, bitrate: '4000k' },
    ];

    constructor() {
        this.s3Client = new S3Client({
            region: config.s3.region,
            endpoint: config.s3.endpoint,
            credentials: {
                accessKeyId: config.s3.accessKeyId,
                secretAccessKey: config.s3.secretAccessKey,
            },
            forcePathStyle: true,
        });
        this.docker = new Docker();
    }

    async startTranscoding(videoKey: string, jobId: string) {
        // Create temp directories for input and output
        const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'video-'));
        const inputDir = path.join(tempDir, 'input');
        const outputDir = path.join(tempDir, 'output');
        
        // Create both directories
        await fs.promises.mkdir(inputDir);
        await fs.promises.mkdir(outputDir);

        try {
            console.log(`Downloading video: ${videoKey}`);
            const inputPath = await this.downloadVideo(videoKey, inputDir);
            
            console.log('Starting transcoding process');
            for (const resolution of this.resolutions) {
                console.log(`Processing resolution: ${resolution.resolution}`);
                await this.transcodeToResolution(videoKey, jobId, resolution, inputDir, outputDir);
            }

            await this.uploadTranscodedFiles(videoKey, outputDir);
            await this.createAndUploadIndexPlaylist(videoKey);
            await this.notifyCompletion(videoKey);

        } catch (error) {
            console.error(`Error during transcoding for video: ${videoKey}`, error);
            throw error;
        } finally {
            await this.cleanup(tempDir);
        }
    }

    private async downloadVideo(videoKey: string, inputDir: string): Promise<string> {
        const inputPath = path.join(inputDir, 'input.mp4');
        
        try {
            const command = new GetObjectCommand({
                Bucket: config.s3.bucket,
                Key: videoKey,
            });

            const response = await this.s3Client.send(command);
            if (!response.Body) {
                throw new Error('No response body from S3');
            }

            const writeStream = fs.createWriteStream(inputPath);
            await new Promise((resolve, reject) => {
                (response.Body as unknown as Readable)
                    .pipe(writeStream)
                    .on('error', reject)
                    .on('finish', resolve);
            });

            return inputPath;
        } catch (error) {
            console.error(`Error downloading video ${videoKey}:`, error);
            throw error;
        }
    }

    private async transcodeToResolution(
        videoKey: string,
        jobId: string,
        resolution: { resolution: string; width: number; height: number; bitrate: string },
        inputDir: string,
        outputDir: string
    ) {
        const containerName = `video-transcoder-${jobId}-${resolution.resolution}`;
        console.log('Input directory:', inputDir);
        console.log('Output directory:', outputDir);

        const container = await this.docker.createContainer({
            Image: 'jrottenberg/ffmpeg',
            name: containerName,
            Cmd: [
                '-i', '/input/input.mp4', // Changed to match the downloaded file name
                '-c:v', 'libx264',
                '-c:a', 'aac',
                '-b:v', resolution.bitrate,
                '-maxrate', resolution.bitrate,
                '-bufsize', `${parseInt(resolution.bitrate) * 2}k`,
                '-vf', `scale=${resolution.width}:${resolution.height}`,
                '-preset', 'veryfast',
                '-profile:v', 'main',
                '-sc_threshold', '0',
                '-g', '48',
                '-keyint_min', '48',
                '-hls_time', '4',
                '-hls_list_size', '0',
                '-hls_segment_filename', `/output/${resolution.resolution}-%03d.ts`,
                '-hls_flags', 'independent_segments',
                '-f', 'hls',
                `/output/${resolution.resolution}.m3u8`,
            ],
            HostConfig: {
                Binds: [
                    `${inputDir}:/input`, // Bind the input directory
                    `${outputDir}:/output`, // Bind the output directory
                ],
                AutoRemove: true,
            },
            Tty: false,
        });

        try {
            // Add debug logging
            console.log('Docker container configuration:', {
                inputBinding: `${inputDir}:/input`,
                outputBinding: `${outputDir}:/output`,
                inputFile: '/input/input.mp4'
            });

            await container.start();
            const logs = await this.getDockerLogs(container);
            console.log(`Transcoding logs for ${resolution.resolution}:`, logs);

            const result = await container.wait();
            if (result.StatusCode !== 0) {
                throw new Error(`Transcoding failed with status ${result.StatusCode}`);
            }
        } catch (error) {
            console.error(`Error processing resolution ${resolution.resolution}:`, error);
            throw error;
        }
    }

    private async uploadTranscodedFiles(videoKey: string, outputDir: string) {
        const files = await fs.promises.readdir(outputDir);
        
        for (const file of files) {
            const filePath = path.join(outputDir, file);
            const fileContent = await fs.promises.readFile(filePath);
            const s3Key = `${videoKey}/${file}`;
            
            await this.uploadFileToS3(s3Key, fileContent);
        }
    }

    private async uploadFileToS3(key: string, body: Buffer) {
        const uploadParams = {
            Bucket: config.s3.bucket,
            Key: key,
            Body: body,
        };

        try {
            await this.s3Client.send(new PutObjectCommand(uploadParams));
            console.log(`Successfully uploaded ${key} to S3`);
        } catch (error) {
            console.error(`Failed to upload ${key} to S3:`, error);
            throw error;
        }
    }

    private async createAndUploadIndexPlaylist(videoKey: string) {
        const indexContent = this.generateIndexPlaylistContent();
        const indexKey = `${videoKey}/index.m3u8`;
        
        await this.uploadFileToS3(indexKey, Buffer.from(indexContent));
        console.log(`Created and uploaded index playlist for ${videoKey}`);
    }

    private generateIndexPlaylistContent(): string {
        let indexContent = '#EXTM3U\n#EXT-X-VERSION:3\n';

        for (const resolution of this.resolutions) {
            indexContent += `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(resolution.bitrate) * 1000},RESOLUTION=${resolution.width}x${resolution.height}\n`;
            indexContent += `${resolution.resolution}.m3u8\n`;
        }

        return indexContent;
    }

    private async cleanup(tempDir: string) {
        try {
            await fs.promises.rm(tempDir, { recursive: true, force: true });
            console.log(`Cleaned up temporary directory: ${tempDir}`);
        } catch (error) {
            console.error(`Error cleaning up temporary directory ${tempDir}:`, error);
        }
    }

    private async notifyCompletion(videoKey: string) {
        console.log(`Transcoding completed for video: ${videoKey}`);
    }

    private async getDockerLogs(container: Docker.Container): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            container.logs({
                follow: true,
                stdout: true,
                stderr: true,
            }, (err, stream) => {
                if (err) {
                    reject(err);
                    return;
                }

                let logs = '';
                stream.on('data', (chunk) => {
                    logs += chunk.toString('utf8');
                });

                stream.on('end', () => {
                    resolve(logs);
                });

                stream.on('error', (error) => {
                    reject(error);
                });
            });
        });
    }
}