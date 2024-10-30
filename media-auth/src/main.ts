import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from './config/configuration';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [config.rabbitMq.url],
        queue: 'central-queue',
        queueOptions: {
          durable: false,
        }
      }
    }
  );

  const httpApp = await NestFactory.create(AppModule);
  httpApp.listen(config.port);
  await app.listen();
  
}

bootstrap();
