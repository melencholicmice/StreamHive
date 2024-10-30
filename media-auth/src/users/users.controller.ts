import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { createUserDto, createUserSchema } from './schemas/createUser.dto';
import { ZodValidationPipe } from 'src/core/validation.pipe';



@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @UsePipes(new ZodValidationPipe(createUserSchema))
    create(@Body() createUserDto: createUserDto) {
        return this.usersService.create(createUserDto);
    }
}
