import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { InternsInformationService } from 'src/interns-information/interns-information.service';
import { UserDto } from './dto/user.dto';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { SimpleUserDto } from './dto/simple-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InternInformation } from 'src/interns-information/entities/intern-information.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly internsInfoService: InternsInformationService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    let savedUserId = '';

    try {
      await this.dataSource.transaction(async (manager) => {
        const { internInformation, password, ...userDataOnly } = createUserDto;

        const user = manager.create(User, {
          ...userDataOnly,
          passwordHash: passwordHash,
        });

        const savedUser = await manager.save(User, user);

        if (createUserDto.role === 'intern' && internInformation) {
          const internInfo = manager.create(InternInformation, {
            internId: savedUser.id,
            field: internInformation.field,
            startDate: internInformation.startDate || new Date(),
            endDate: internInformation.endDate || new Date(),
          });

          await manager.save(InternInformation, internInfo);
        }

        savedUserId = savedUser.id;
      });

      return await this.findOne(savedUserId);
    } catch (error) {
      throw new HttpException('Error creating user: ' + error.message, 500);
    }
  }

  async findAll(role?: string): Promise<UserDto[]> {
    try {
      const whereCondition: any = {
        isDeleted: false,
      };

      // Nếu có role parameter, thêm vào điều kiện where
      if (role) {
        whereCondition.role = role;
      }

      const users = await this.usersRepository.find({
        where: whereCondition,
        relations: ['internInformation'],
      });

      return plainToInstance(UserDto, users);
    } catch (error) {
      throw new HttpException('Error fetching users: ' + error.message, 500);
    }
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.usersRepository.findOne({
      where: {
        id: id,
        isDeleted: false,
      },
      relations: ['internInformation'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return plainToInstance(UserDto, user);
  }

  async findByUsername(username: string): Promise<User> {
    try {
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
    } catch (error) {
      throw new HttpException('Error fetching user: ' + error.message, 500);
    }
  }

  async findSimpleInfo(id: string): Promise<SimpleUserDto> {
    try {
      const user = await this.usersRepository.findOne({
        where: {
          id: id,
          isDeleted: false,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return plainToInstance(SimpleUserDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Error fetching user: ' + error.message, 500);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const user = await this.findOne(id);

        const { password, internInformation, ...updateUserData } =
          updateUserDto;

        Object.assign(user, updateUserData);

        if (
          user.role === 'intern' &&
          internInformation &&
          user.internInformation
        ) {
          Object.assign(user.internInformation, internInformation);
          await manager.save(InternInformation, user.internInformation);
        }

        await manager.save(User, user);
      });

      return this.findOne(id);
    } catch (error) {
      throw new HttpException('Error updating user:' + error.message, 500);
    }
  }

  async updateProfile(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    try {
      const { password, internInformation, ...updateData } = updateUserDto;
      const user = await this.usersRepository.findOne({
        where: { id: id, isDeleted: false },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      Object.assign(user, updateData);
      await this.usersRepository.save(user);

      console.log('User profile updated:', user);

      return plainToInstance(UserDto, user);
    } catch (error) {
      throw new InternalServerErrorException('Error updating user profile');
    }
  }
}
