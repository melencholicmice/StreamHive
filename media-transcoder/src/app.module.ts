import { Module } from '@nestjs/common';
import { TranscoderModule } from './transcoder/transcoder.module';
import { BullModule } from '@nestjs/bullmq';
import config from './config/configuration';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: config.redis.host,
        port: config.redis.port,
      }
    }),
    TranscoderModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
