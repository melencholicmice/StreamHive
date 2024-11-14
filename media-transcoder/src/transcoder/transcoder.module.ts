import { Module } from '@nestjs/common';
import { TranscoderService } from './transcoder.service';
import { TranscoderController } from './transcoder.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'video-queue',
    }),
  ],
  providers: [TranscoderService],
  controllers: [TranscoderController],
})
export class TranscoderModule {}
