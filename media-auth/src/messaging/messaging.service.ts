import { Injectable } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Injectable()
export class MessagingService {
  @MessagePattern('video.upload') // This should match the routing key sent by MinIO
  async handleVideoUpload(@Payload() data: any) {
    console.log('Received video upload message:', data);
    // Logic to create DB record for the uploaded video or further processing
  }
}