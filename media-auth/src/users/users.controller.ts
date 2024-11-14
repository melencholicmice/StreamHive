import { Body, Controller, Get, Post, UseGuards, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { createUserDto, createUserSchema } from './dtos/createUser.dto';
import { ZodValidationPipe } from 'src/core/validation.pipe';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CurrentUser } from 'src/auth/currentUser.decorator';
import { User } from './user.entity';



@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @UsePipes(new ZodValidationPipe(createUserSchema))
    create(@Body() createUserDto: createUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get('all')
    @UseGuards(JwtAuthGuard)
    getUsers(){
        return this.usersService.getAllUser();
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getUser(
        @CurrentUser() user: User
    ){
        const userEntity = await this.usersService.getUserById(user.id)
        const {password , ...userObj} = userEntity;
        return userObj
    }
}
