import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import config from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [config.rabbitMq.url],
        queue: 'video-queue',
        queueOptions: {
          durable: true,
        },
      },
    }
  );
  
  await app.listen();
}
bootstrap();
