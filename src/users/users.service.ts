import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { InternsInformationService } from 'src/interns-information/interns-information.service';
import { UserDto } from './dto/user.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly internsInfoService: InternsInformationService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const password_hash = createUserDto.password;

    try {
      const user = this.usersRepository.create({
        ...createUserDto,
        password_hash: password_hash,
      });

      const newUser = await this.usersRepository.save(user);

      // If role is 'intern', create intern information
      if (createUserDto.role === 'intern') {
        await this.internsInfoService.create({
          intern_id: newUser.id,
          field: createUserDto.intern_information?.field,
          start_date:
            createUserDto.intern_information?.start_date || new Date(),
          end_date: createUserDto.intern_information?.end_date || new Date(),
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
        is_deleted: false,
      },
    });

    return plainToInstance(UserDto, users);
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.usersRepository.findOne({
      where: {
        id: id,
        is_deleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'intern') {
      user.intern_information = await this.internsInfoService.findByInternId(
        user.id,
      );
    }

    return plainToInstance(UserDto, user);
  }
}
