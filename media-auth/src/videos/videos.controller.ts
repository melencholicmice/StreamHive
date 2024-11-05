import { Controller, Get, Post, Body, Query, ParseIntPipe, UsePipes, UseGuards } from '@nestjs/common';
import { VideosService } from './videos.service';
import { uploadVideoDto, uploadVideoSchema } from './dto/uploadVideo.dto';
import { uploadCompleteDto, uploadCompleteSchema } from './dto/uploadComplete.dto';
import { ZodValidationPipe } from 'src/core/validation.pipe';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('videos')
export class VideosController {
    constructor(private videoService: VideosService){}

    @Post('upload-start')
    @UsePipes(new ZodValidationPipe(uploadVideoSchema))
    // @UseGuards(JwtAuthGuard)
    async startUpload(
        @Body() body : uploadVideoDto
    ){
        const uploadId = await this.videoService.initiateMultipartUpload(body.key);
        return { uploadId};
    }

    @Get('presigned-url')
    async getPresignedUrls(
        @Query('key') key: string,
        @Query('uploadId') uploadId: string,
        @Query('partNumber', ParseIntPipe) partNumber: number,    
    ){
        const url = await this.videoService.generatePresignedUrlByPartNumber(key, uploadId, partNumber);
        return { url };
    }

    @Post('upload-complete')
    @UsePipes(new ZodValidationPipe(uploadCompleteSchema))
    // @UseGuards(JwtAuthGuard)
    async completeUpload(
        @Body() body : uploadCompleteDto
    ){
        await this.videoService.completeMultipartUpload(body.key, body.uploadId, body.parts);
        return { message: 'Upload complete' };
    }

}
