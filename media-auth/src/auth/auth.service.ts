import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import config from 'src/config/configuration';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { TokenPayload } from './token-payload.interface';


@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private  jwtService: JwtService,
        
    ){}

    async verifyUser(email: string, password: string): Promise<User> {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            throw new UnauthorizedException({
                message: 'User not found',
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new UnauthorizedException({
                message: 'Invalid credentials',
            });
        }

        return user;        
    }

    async login(user: User,response: Response){
        try{
            const expiresAccessToken = new Date();
            expiresAccessToken.setMilliseconds(
                expiresAccessToken.getTime() + parseInt(config.jwt.expiresIn)
            )

            const payload: TokenPayload = {
                id: user.id,
                username: user.username,
                email: user.email,
            }

            const accessToken = this.jwtService.sign(payload,
                {
                    secret: config.jwt.secret,
                    expiresIn: `${config.jwt.expiresIn}ms`,
                }
            );

            response.cookie('Authentication', accessToken, {
                httpOnly: true,
                secure: true,
                expires: expiresAccessToken,
            })
        }
        catch(error){
            throw new Error("Failed to login: " + error.message);
        }
    }

}
