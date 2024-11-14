import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
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
    { resolution: '1080p', width: 1920, height: 1080, bitrate: '5000k' },
    { resolution: '720p', width: 1280, height: 720, bitrate: '3000k' },
    { resolution: '480p', width: 854, height: 480, bitrate: '1500k' },
    { resolution: '360p', width: 640, height: 360, bitrate: '800k' },
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

  private createResolutionCommands(): string[] {
    const videoFilterComplex = `[0:v]split=${this.resolutions.length}${this.resolutions.map((_, index) => `[v${index}]`).join('')};${this.resolutions
      .map(
        (resolution, index) =>
          `[v${index}]scale=w=${resolution.width}:h=${resolution.height}[v${index}out]`,
      )
      .join(';')}`;

    const commands = [
      '-filter_complex',
      videoFilterComplex,
      ...this.resolutions.flatMap((resolution, index) => [
        `-map`,
        `[v${index}out]`,
        `-c:v:${index}`,
        'libx264',
        `-b:v:${index}`,
        resolution.bitrate,
        `-maxrate:v:${index}`,
        `${parseInt(resolution.bitrate) * 1.07}k`,
        `-bufsize:v:${index}`,
        `${parseInt(resolution.bitrate) * 1.5}k`,
        '-preset',
        'veryfast',
        '-profile:v',
        'main',
        '-sc_threshold',
        '0',
        '-g',
        '48',
        '-keyint_min',
        '48',
        `-hls_time`,
        '4',
        `-hls_list_size`,
        '0',
        `-hls_segment_filename`,
        `/output/${resolution.resolution}/segment-%03d.ts`,
        `-hls_flags`,
        'independent_segments',
        `-f`,
        'hls',
        `/output/${resolution.resolution}/playlist.m3u8`,
      ]),
      '-master_pl_name',
      '/output/master.m3u8', // Master playlist
      '-hls_playlist_type',
      'vod',
      '-var_stream_map',
      this.resolutions.map((_, index) => `v:${index},a:${index}`).join(' '),
    ];

    return commands;
  }

  async startTranscoding(videoKey: string, jobId: string) {
    // Create temp directories for input and output
    const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'video-'));
    const inputDir = path.join(tempDir, 'input');
    const outputDir = path.join(tempDir, 'output');

    // Create both directories
    await fs.promises.mkdir(inputDir);
    await fs.promises.mkdir(outputDir);

    // Create resolution directories
    for (const resolution of this.resolutions) {
      const resolutionDir = path.join(outputDir, resolution.resolution);
      await fs.promises.mkdir(resolutionDir, { recursive: true });
    }

    try {
      console.log(`Downloading video: ${videoKey}`);
      const inputPath = await this.downloadVideo(videoKey, inputDir);

      console.log('Starting transcoding process');

      await this.transcodeToResolution(jobId, inputDir, outputDir);

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

  private async downloadVideo(
    videoKey: string,
    inputDir: string,
  ): Promise<string> {
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
    jobId: string,
    inputDir: string,
    outputDir: string,
  ) {
    const containerName = `video-transcoder-${jobId}`;
    console.log('Input directory:', inputDir);
    console.log('Output directory:', outputDir);

    const container = await this.docker.createContainer({
      Image: 'jrottenberg/ffmpeg',
      name: containerName,
      Cmd: ['-i', '/input/input.mp4', ...this.createResolutionCommands()],
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
        inputFile: '/input/input.mp4',
      });

      await container.start();

      // Attach to container logs and stream them to console
      const logStream = await container.logs({
        follow: true,
        stdout: true,
        stderr: true,
      });
      logStream.on('data', (chunk) => {
        console.log(chunk.toString('utf8'));
      });

      const result = await container.wait();
      if (result.StatusCode !== 0) {
        throw new Error(`Transcoding failed with status ${result.StatusCode}`);
      }
    } catch (error) {
      console.error(`Error processing ${containerName}:`, error);
      throw error;
    }
  }

  private async uploadTranscodedFiles(videoKey: string, outputDir: string) {
    // Iterate over each resolution folder and upload files as buffers
    for (const resolution of this.resolutions) {
      const resolutionDir = path.join(outputDir, resolution.resolution);

      // Skip resolution if its folder does not exist
      if (!fs.existsSync(resolutionDir)) {
        console.warn(`Resolution directory ${resolutionDir} not found.`);
        continue;
      }

      // Upload playlist.m3u8 (resolution playlist)
      const playlistPath = path.join(resolutionDir, 'playlist.m3u8');
      if (fs.existsSync(playlistPath)) {
        const playlistBuffer = await fs.promises.readFile(playlistPath);
        const s3PlaylistKey = `${this.getDirectoryFromFilePath(videoKey)}${resolution.resolution}/playlist.m3u8`;
        await this.uploadFileToS3(s3PlaylistKey, playlistBuffer);
      }

      // Upload all segment files (.ts files) as buffers
      const files = await fs.promises.readdir(resolutionDir);
      for (const file of files) {
        if (file.endsWith('.ts')) {
          // Only upload .ts files
          const filePath = path.join(resolutionDir, file);
          const fileBuffer = await fs.promises.readFile(filePath);
          const s3Key = `${this.getDirectoryFromFilePath(videoKey)}${resolution.resolution}/${file}`;

          await this.uploadFileToS3(s3Key, fileBuffer);
        }
      }
    }
  }

  private getDirectoryFromFilePath(filePath: string): string {
    const parts = filePath.split('/');
    return parts.slice(0, parts.length - 1).join('/') + '/';
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
    const directoryKey = this.getDirectoryFromFilePath(videoKey);
    const indexContent = this.generateMasterPlaylistContent();
    const indexKey = `${directoryKey}index.m3u8`;

    await this.uploadFileToS3(indexKey, Buffer.from(indexContent));
    console.log(
      `Created and uploaded master index playlist for ${directoryKey}`,
    );
  }

  private generateMasterPlaylistContent(): string {
    let indexContent = '#EXTM3U\n#EXT-X-VERSION:3\n';

    for (const resolution of this.resolutions) {
      indexContent += `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(resolution.bitrate) * 1000},RESOLUTION=${resolution.width}x${resolution.height}\n`;
      indexContent += `${resolution.resolution}/playlist.m3u8\n`;
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
}
