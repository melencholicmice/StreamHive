import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './video.entity';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import config from 'src/config/configuration';

@Module({
  imports:[
    TypeOrmModule.forFeature([Video]),
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [config.rabbitMq.url],
          queue: 'notification-queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [VideosService],
  controllers: [VideosController]
})
export class VideosModule {}

