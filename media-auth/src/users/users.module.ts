import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { ZodValidationPipe } from 'src/core/validation.pipe';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';

@Module({
  imports: [ZodValidationPipe, TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
