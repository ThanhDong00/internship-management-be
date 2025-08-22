import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import { TrainingPlan } from 'src/training-plans/entities/training-plan.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { Skill } from 'src/skills/entities/skill.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';

export interface FindAllUsersResponse {
  users: UserDto[];
  total: {
    intern: number;
    mentor: number;
    admin: number;
    completedIntern: number;
    isAssigned: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

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

  async findAll(
    role?: string,
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<FindAllUsersResponse> {
    try {
      const whereCondition: any = {
        isDeleted: false,
      };

      if (role) {
        whereCondition.role = role;
      }

      let skip = 0;
      if (page && limit) {
        skip = (page - 1) * limit;
      }

      const queryBuilder = this.usersRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.internInformation', 'internInformation')
        .where('user.isDeleted = :isDeleted', { isDeleted: false });

      if (role) {
        queryBuilder.andWhere('user.role = :role', { role });
      }

      if (search) {
        queryBuilder.andWhere(
          '(LOWER(user.fullName) LIKE LOWER(:search) OR LOWER(user.username) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
          { search: `%${search}%` },
        );
      }

      const totalItems = await queryBuilder.getCount();

      // const users = await queryBuilder.skip(skip).take(limit).getMany();
      if (limit) {
        queryBuilder.skip(skip).take(limit);
      }

      const users = await queryBuilder.getMany();

      const allUsers = await this.usersRepository.find({
        where: whereCondition,
        relations: ['internInformation'],
      });

      const total = {
        intern: allUsers.filter((user) => user.role === 'intern').length,
        mentor: allUsers.filter((user) => user.role === 'mentor').length,
        admin: allUsers.filter((user) => user.role === 'admin').length,
        completedIntern: allUsers.filter(
          (user) =>
            user.role === 'intern' &&
            user.internInformation?.status === 'Completed',
        ).length,
        isAssigned: allUsers.filter((user) => user.isAssigned).length,
      };

      const totalPages = Math.ceil(totalItems / (limit || totalItems));

      return {
        users: plainToInstance(UserDto, users),
        total,
        pagination: {
          currentPage: page || 1,
          totalPages,
          totalItems,
          itemsPerPage: limit || totalItems,
        },
      };
    } catch (error) {
      throw new HttpException('Error fetching users: ' + error.message, 500);
    }
  }

  async findOne(id: string): Promise<UserDto> {
    try {
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
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching user: ' + error.message,
      );
    }
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

  async softDelete(id: string, user: SimpleUserDto): Promise<void> {
    try {
      if (id === user.id)
        throw new BadRequestException('You cannot delete your own account');

      if (user.role !== 'admin')
        throw new ForbiddenException('Only admin can delete users');

      const targetUser = await this.usersRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['internInformation'],
      });

      if (!targetUser) throw new NotFoundException('User not found');

      if (targetUser.role === 'intern') {
        if (targetUser.internInformation) {
          if (targetUser.internInformation.planId) {
            throw new ConflictException(
              'Cannot delete this user! Because conflict data',
            );
          }
        }

        await this.dataSource.transaction(async (manager) => {
          await manager.update(User, { id: id }, { isDeleted: true });
          await manager.update(
            InternInformation,
            { internId: id },
            { isDeleted: true },
          );
        });
      } else {
        await this.checkUserReferences(id, targetUser);

        await this.usersRepository.update(id, { isDeleted: true });
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error deleting user: ' + error.message,
      );
    }
  }

  private async checkUserReferences(
    userId: string,
    targetUser: User,
  ): Promise<void> {
    const references: string[] = [];

    // Training plan
    const trainingPlanCount = await this.dataSource
      .getRepository(TrainingPlan)
      .createQueryBuilder('plan')
      .where('plan.createdBy = :userId', { userId: userId })
      .andWhere('plan.isDeleted = false')
      .getCount();

    if (trainingPlanCount > 0) {
      references.push(
        `${trainingPlanCount} training plan(s) created by this user`,
      );
    }

    // Task
    const taskCount = await this.dataSource
      .getRepository(Task)
      .createQueryBuilder('task')
      .where('task.createdBy = :userId', { userId })
      .andWhere('task.isDeleted = false')
      .getCount();

    if (taskCount > 0) {
      references.push(`${taskCount} task(s) created by this user`);
    }

    // Skill
    const skillCount = await this.dataSource
      .getRepository(Skill)
      .createQueryBuilder('skill')
      .where('skill.createdBy = :userId', { userId })
      .andWhere('skill.isDeleted = false')
      .getCount();

    if (skillCount > 0) {
      references.push(`${skillCount} skill(s) created by this user`);
    }

    // Assignment
    const assignmentCount = await this.dataSource
      .getRepository(Assignment)
      .createQueryBuilder('assignment')
      .where('assignment.createdBy = :userId', { userId })
      .andWhere('assignment.isDeleted = false')
      .getCount();

    if (assignmentCount > 0) {
      references.push(`${assignmentCount} assignment(s) created by this user`);
    }

    // Total
    if (references.length > 0) {
      throw new BadRequestException(
        `Cannot delete user. It is being used in: ${references.join(', ')}. Please remove the user from these entities first.`,
      );
    }
  }
}
