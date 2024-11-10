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
            const videoEntity : Video =  await this.videoService.createVideoEntity(
                body.videoName, 
                body.description, 
                user
            );
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
        this.videoQueue.add('video-transcoding-job', {
            userId: user.id,
            key: `${this.videoService.createKeyDirectory(user.id, body.videoName)}${body.key}`,
        });
        console.log("key:= " + `${this.videoService.createKeyDirectory(user.id, body.videoName)}${body.key}`);
        console.log('video uploaded event emitted');
        return { message: 'Upload complete' };
    }

    @Get('all-videos')
    async getAllVideos(){
        return this.videoService.getAllVideos()
    }

    @Get('video-by-id')
    async getVideoById(@Query('videoId') videoId: string){
        return this.videoService.getVideoById(videoId);
    }
}
