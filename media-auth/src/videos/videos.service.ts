import { CompleteMultipartUploadCommand, CreateMultipartUploadCommand, S3Client, UploadPartCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from 'src/config/configuration';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from './video.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';

@Injectable()
export class VideosService {

    constructor(
        @InjectRepository(Video) private videoRepository : Repository<Video>  
    ){}

    private s3Client = new S3Client({
        region: config.s3.region,
        endpoint: config.s3.endpoint,
        credentials: {
            accessKeyId: config.s3.accessKeyId,
            secretAccessKey: config.s3.secretAccessKey,
        },
        forcePathStyle: true,
    })

    async initiateMultipartUpload(key: string) {
        const command = new CreateMultipartUploadCommand({
            Bucket: config.s3.bucket,
            Key: key,
        });
        
        try {
            const response = await this.s3Client.send(command);
            return response.UploadId;
        } catch (error) {
            console.log(error.message);
            throw error;
        }        
    }

    async generatePresignedUrls(key: string, uploadId: string, totalParts: number) {
        const urls = [];
        for (let i = 1; i <= totalParts; i++) {
            const command = new UploadPartCommand({
                Bucket: config.s3.bucket,
                Key: key,
                UploadId: uploadId,
                PartNumber: i,
            });
            const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
            urls.push(url);
        }
        return urls;
    }

    async generatePresignedUrlByPartNumber(key: string, uploadId: string, partNumber: number) {
        const command = new UploadPartCommand({
            Bucket: config.s3.bucket,
            Key: key,
            UploadId: uploadId,
            PartNumber: partNumber,
        });
        const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
        return url;
    }

    async createVideoEntity(title:string, description: string, user: User) {
        const video = this.videoRepository.create({
            title,
            description,
            user
        });
        const savedVideo = await this.videoRepository.save(video);
        return savedVideo;
    }

    async completeMultipartUpload(key: string, uploadId: string, parts: { PartNumber: number, ETag: string }[]) {
        const command = new CompleteMultipartUploadCommand({
            Bucket: config.s3.bucket,
            Key: key,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: parts,
            },
        })
        try {
            const response = await this.s3Client.send(command);
            if (response) {
               return response;
            }
        } catch (error) {
            console.log(error.message);
            throw error;
        }
    }

    async getVideosByUser(user: User) {
        const videos = await this.videoRepository.find({
            where: {
                user
            }
        });
        return videos;
    }

    async updateBucket(videoId: string, bucket: string) {
        const video = await this.videoRepository.findOne({
            where: {
                id: videoId
            }
        });
        if (!video) {
            throw new Error('Video not found');
        }
        video.bucket = bucket;
        const savedVideo = await this.videoRepository.save(video);
        return savedVideo;
    }


    async getVideoById(videoId: string) {
        const video = await this.videoRepository.findOne({
            where: {
                id: videoId
            }
        });
        if (!video) {
            throw new Error('Video not found');
        }
        return video;
    }

}
