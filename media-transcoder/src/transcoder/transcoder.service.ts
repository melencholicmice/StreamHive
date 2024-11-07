import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as stream from 'stream';
import { pipeline } from 'stream/promises';
import Docker  from 'dockerode';
import { connect,Connection, Channel } from 'amqplib';
import config from 'src/config/configuration';

@Injectable()
export class TranscoderService implements OnModuleInit {
    private docker: Docker;
    private s3Client: S3Client; 
    private connection: Connection;
    private channel: Channel;

    private resolutions = [
        { resolution : '144p', width: 256, height: 144 },
        { resolution : '240p', width: 426, height: 240 },
        { resolution : '360p', width: 640, height: 360 },
        { resolution : '480p', width: 854, height: 480 },
        { resolution : '720p', width: 1280, height: 720 },
        { resolution : '1080p', width: 1920, height: 1080 },
    ]

    constructor(
        @Inject('NOTIFICATION_SERVICE') private readonly client: ClientProxy,
    ){
        this.docker = new Docker();
        this.s3Client = new S3Client({
            region: config.s3.region,
            endpoint: config.s3.endpoint,
            credentials: {
                accessKeyId: config.s3.accessKeyId,
                secretAccessKey: config.s3.secretAccessKey,
            },
            forcePathStyle: true,
        });
    }

    async onModuleInit() {
        this.connection = await connect(config.rabbitMq.url);
        this.channel = await this.connection.createChannel();

        const queue = 'video-queue';
        await this.channel.assertQueue(queue, { durable: false });
        console.log('Transcoder service initialized and listening to queue:', queue);

        this.channel.consume(queue, async (message) => {
            if (message){
                const { videoKey } = JSON.parse(message.content.toString());
                console.log(`Received message for video: ${videoKey}`);
                await this.startTranscoding(videoKey);
                this.channel.ack(message);
            }
        })
    }

    private async startTranscoding(videoKey: string){
        try {
            await Promise.all(
              this.resolutions.map(async (resolution) => {
                await this.transcodeToResolution(videoKey, resolution.resolution, resolution.width, resolution.height);
              }),
            );
            await this.notifyCompletion(videoKey);
        } catch (error) {
            console.error(`Error during transcoding for video: ${videoKey}`, error);
        }
    }

    private async transcodeToResolution(videoKey: string, resolution: string, width: number, height: number) {
        const inputStream = await this.downloadVideoFromS3(videoKey);
        const containerName = `video-transcoder-${videoKey}-${resolution}`;
        
        const container = await this.docker.createContainer({
          Image: 'jrottenberg/ffmpeg',
          name: containerName,
          Cmd: [
            '-i', 'pipe:0', // FFmpeg will read from stdin (piped input)
            '-vf', `scale=${width}:-2`,
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '28',
            'pipe:1', // FFmpeg will output to stdout (piped output)
          ],
        });
    
        const containerStream = await container.attach({ stream: true, stdin: true, stdout: true, stderr: true });
        
        // Start the container before piping
        await container.start();
        console.log(`Transcoding ${videoKey} to ${resolution} resolution`);
    
        // Create a PassThrough stream to handle the container output
        const outputStream = new stream.PassThrough();
        containerStream.pipe(outputStream);

        await Promise.all([
          pipeline(inputStream, containerStream),
          this.uploadToS3(outputStream, `${videoKey}/${resolution}-${videoKey}`),
        ]);
    
        // Pipe the input stream to the container's stdin, and output stream from FFmpeg to S3
        await container.wait();
        console.log(`Transcoding ${videoKey} to ${resolution} resolution completed`);
    
        await container.remove();
        console.log(`Container ${containerName} removed`);
    }
    

    private async downloadVideoFromS3(videoKey: string): Promise<stream.Readable> {
        const command = new GetObjectCommand({
            Bucket: config.s3.bucket,
            Key: videoKey,
        });

        const data = await this.s3Client.send(command);

        return data.Body as stream.Readable;
    }

    private async uploadToS3(inputStream: stream.Readable, destinationKey: string) {
        const uploadParams = {
          Bucket: config.s3.bucket,
          Key: destinationKey,
          Body: inputStream,
        };
    
        try {
          await this.s3Client.send(new PutObjectCommand(uploadParams));
          console.log(`Uploaded ${destinationKey} to S3`);
        } catch (error) {
          console.error(`Failed to upload ${destinationKey} to S3`, error);
        }
    }

    private async notifyCompletion(videoKey: string) {
        const message = { videoKey, status: 'completed' };
        console.log(`Notifying completion for video: ${videoKey}`);
        this.client.emit('video-trancoding-completed', message);
    }
}