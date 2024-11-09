import { Controller } from '@nestjs/common';
import { TranscoderService } from './transcoder.service';
import { Queue, Worker, Job } from 'bullmq';
import { InjectQueue, Processor } from '@nestjs/bullmq';
import config from 'src/config/configuration';

@Controller('transcoder')
export class TranscoderController {
    private worker: Worker;

    constructor(
        @InjectQueue('video-queue') private videoQueue: Queue,
        private readonly transcoderService: TranscoderService,
    ) {
        this.startWorker();
    }

    private async startWorker() {
        this.worker = new Worker('video-queue', async (job: Job) => {
            // userId: 1,
            // key: 'test-key',
            // uploadId: 'test-upload-id',
            console.log(`Processing job ${job.name} , ${job.data.uploadId} , ${job.data.key} ${Object.entries(job.data)}`);;
            

            switch(job.name){
                case 'video-transcoding-job':{
                    await this.transcoderService.startTranscoding(job.data.key, job.id);
                    break;
                }
            }
        }, {
            connection: {
                host: config.redis.host,
                port: config.redis.port,
            },
        });

        this.worker.on('completed', (job: Job) => {
            console.log(`Job ${job.id} ${job.data} completed`);
        });

        this.worker.on('failed', (job: Job, err: Error) => {
            console.error(`Job ${job.id} ${job.data} failed with error: ${err.message}`);
        });

        this.worker.on('error', (err: Error) => {
            console.error(`Worker error: ${err.message}`);
        });

        console.log('Worker started');

    }

    // Method to add new jobs
    
}