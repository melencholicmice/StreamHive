import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './video.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Video])],
  providers: [VideosService],
  controllers: [VideosController]
})
export class VideosModule {}

