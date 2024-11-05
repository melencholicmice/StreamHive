import { CompleteMultipartUploadCommand, CreateMultipartUploadCommand, S3Client, UploadPartCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from 'src/config/configuration';

@Injectable()
export class VideosService {
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

    async completeMultipartUpload(key: string, uploadId: string, parts: { PartNumber: number, ETag: string }[]) {
        const command = new CompleteMultipartUploadCommand({
            Bucket: config.s3.bucket,
            Key: key,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: parts,
            },
        })
        await this.s3Client.send(command);
    }

}
