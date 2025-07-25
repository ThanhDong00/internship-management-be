import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SimpleUserDto } from 'src/users/dto/simple-user.dto';
import { TaskDto } from './dto/task.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
  ) {}

  async create(task: CreateTaskDto, user: SimpleUserDto): Promise<Task> {
    try {
      const newTask = this.taskRepository.create({
        ...task,
        createdBy: user.id,
      });
      return await this.taskRepository.save(newTask);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating task: ' + error.message,
      );
    }
  }

  async findAll(user: SimpleUserDto): Promise<Task[]> {
    try {
      return await this.taskRepository.find({
        where: { isDeleted: false, createdBy: user.id },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching tasks: ' + error.message,
      );
    }
  }

  async findOne(id: string, user: SimpleUserDto): Promise<TaskDto> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id, isDeleted: false, createdBy: user.id },
        relations: ['creator'],
      });

      if (!task) throw new NotFoundException('Task not found');

      return plainToInstance(TaskDto, task, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error fetching task: ' + error.message,
      );
    }
  }

  async update(
    id: string,
    updateData: UpdateTaskDto,
    user: SimpleUserDto,
  ): Promise<Task> {
    try {
      const task = await this.findOne(id, user);
      if (!task) throw new NotFoundException('Task not found');

      Object.assign(task, updateData);
      return await this.taskRepository.save(task);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error updating task');
    }
  }
}
