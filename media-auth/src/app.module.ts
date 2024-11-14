import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { VideosModule } from './videos/videos.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: config.database.host,
      port: config.database.port,
      username: config.database.username,
      password: config.database.password,
      database: config.database.database,
      autoLoadEntities: true,
      synchronize: true,
      entities: [__dirname + '/../**/*.entity{.ts}'],
    }),
    BullModule.forRoot({
      connection: {
        host: config.reddis.host,
        port: config.reddis.port,
        // password: config.reddis.password,
      },
    }),
    UsersModule,
    AuthModule,
    VideosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
