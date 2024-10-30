import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { createUserDto, createUserResponseDto } from './schemas/createUser.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>
    ) {}

    async create(user: createUserDto): Promise<createUserResponseDto> {
        try {
            const currUser = await this.userRepository.create(user);
            const curruser = await this.userRepository.save(currUser);
            const { password, ...result } = curruser;
            return result;
        } catch (error) {
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }
}