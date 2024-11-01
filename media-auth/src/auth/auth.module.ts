import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from 'src/users/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { LocalStrategy } from './stratergies/local.strategy';
import { UsersService } from 'src/users/users.service';
import { JwtStratergy } from './stratergies/jwt.strategy';

@Module({
  imports: [User,UsersModule, PassportModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy,JwtStratergy, JwtService]
})
export class AuthModule {}
