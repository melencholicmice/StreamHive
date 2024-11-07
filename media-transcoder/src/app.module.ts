import { Module } from '@nestjs/common';
import { TranscoderModule } from './transcoder/transcoder.module';

@Module({
  imports: [TranscoderModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
