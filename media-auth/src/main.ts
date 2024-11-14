import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from './config/configuration';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });

  app.use(cookieParser());

  await app.listen(config.port);
}

bootstrap();
