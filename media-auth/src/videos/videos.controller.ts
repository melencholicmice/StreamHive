import { Controller, Get, Post, Body, Query, ParseIntPipe, UseGuards, Inject } from '@nestjs/common';
import { VideosService } from './videos.service';
import { uploadVideoDto, uploadVideoSchema } from './dto/uploadVideo.dto';
import { uploadCompleteDto, uploadCompleteSchema } from './dto/uploadComplete.dto';
import { ZodValidationPipe } from 'src/core/validation.pipe';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CurrentUser } from 'src/auth/currentUser.decorator';
import { User } from 'src/users/user.entity';
import { Video } from './video.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';


@Controller('videos')
export class VideosController {
    constructor(
        private videoService: VideosService,
        @InjectQueue('video-queue') private videoQueue: Queue,
    ){}

    @Post('upload-start')
    @UseGuards(JwtAuthGuard)
    async startUpload(
        @CurrentUser() user : User,
        @Body(new ZodValidationPipe(uploadVideoSchema)) body : uploadVideoDto,
    ){
        try{
            const uploadId = await this.videoService.initiateMultipartUpload(body.key,user.id,body.videoName);
            const videoEntity : Video =  await this.videoService.createVideoEntity(body.key, body.description, user);
            return { 
                uploadId: uploadId,
                videoId : videoEntity.id  
            };
        }
        catch(error){
            console.log(error.message);
            throw error;
        }
    }

    @Get('presigned-url')
    @UseGuards(JwtAuthGuard)
    async getPresignedUrls(
        @Query('key') key: string,
        @Query('uploadId') uploadId: string,
        @Query('partNumber', ParseIntPipe) partNumber: number, 
        @Query('videoName') videoName: string,
        @CurrentUser() user : User,   
    ){
        const url = await this.videoService.generatePresignedUrlByPartNumber(key, uploadId, partNumber,user.id, videoName);
        return { url };
    }

    @Post('upload-complete')
    @UseGuards(JwtAuthGuard)
    async completeUpload(
        @CurrentUser() user: User,
        @Body(new ZodValidationPipe(uploadCompleteSchema)) body : uploadCompleteDto
    ){
        await this.videoService.completeMultipartUpload(body.key, body.uploadId, body.parts,user.id, body.videoName);
        await this.videoService.updateBucketLocation(user.id, body.videoName,body.videoId, body.key);
        console.log({
            userId: user.id,
            key: body.key,
            uploadId : body.uploadId,
        })
        console.log('starting event emitter');
        // this.client.emit('video-uploaded', {
        //     userId: user.id,
        //     key: body.key,
        //     uploadId : body.uploadId,
        // });
        console.log("key:= " + body.key);
        console.log('video uploaded event emitted');
        return { message: 'Upload complete' };
    }

    @Get('test-microservice')
    async testMicroservice() {
        // 
        this.videoQueue.add('video-transcoding-job', {
            userId: 1,
            key: '6207e176-54d1-43fb-b9d1-aec6e0bef3ff/job-test-1/Video_2024-09-21_15-56-00.mp4',
            uploadId: 'test-upload-id',
        });
        console.log('video uploaded event emitted');
        return { message: 'Upload complete' };
    }
}
