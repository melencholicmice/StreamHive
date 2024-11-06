import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { createUserDto, createUserResponseDto } from './dtos/createUser.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>
    ) {}

    async create(user: createUserDto): Promise<createUserResponseDto> {
        const newUser = this.userRepository.create(user);
        const savedUser = await this.userRepository.save(newUser);
        const { password, ...result } = savedUser;
        return result;
    }
    
    async findOneByEmail(email:string) : Promise<User | null> {
        return await this.userRepository.findOne({ where: { email } })
    }

    async getAllUser() : Promise<User[]>{
        return await this.userRepository.find();
    }

    async getUserById(id: string) : Promise<User | null> {
        return await this.userRepository.findOne({ where: { id } })
    }
}