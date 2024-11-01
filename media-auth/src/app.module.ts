import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from './config/configuration';
import { AuthModule } from './auth/auth.module';

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
      entities:[__dirname + '/../**/*.entity{.ts}',]
    })
    ,UsersModule, AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
