import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { InternsInformationService } from 'src/interns-information/interns-information.service';
import { UserDto } from './dto/user.dto';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly internsInfoService: InternsInformationService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    try {
      const user = this.usersRepository.create({
        ...createUserDto,
        passwordHash: passwordHash,
      });

      const newUser = await this.usersRepository.save(user);

      // If role is 'intern', create intern information
      if (createUserDto.role === 'intern') {
        await this.internsInfoService.create({
          internId: newUser.id,
          field: createUserDto.internInformation?.field,
          startDate: createUserDto.internInformation?.startDate || new Date(),
          endDate: createUserDto.internInformation?.endDate || new Date(),
        });
      }

      return plainToInstance(UserDto, newUser);
    } catch (error) {
      throw new HttpException('Error creating user: ' + error.message, 500);
    }
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.usersRepository.find({
      where: {
        isDeleted: false,
      },
    });

    return plainToInstance(UserDto, users);
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.usersRepository.findOne({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'intern') {
      user.internInformation = await this.internsInfoService.findByInternId(
        user.id,
      );
    }

    return plainToInstance(UserDto, user);
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        username: username,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
