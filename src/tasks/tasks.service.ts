import { Injectable } from '@nestjs/common';
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
    const newTask = this.taskRepository.create({ ...task, createdBy: user.id });
    return await this.taskRepository.save(newTask);
  }

  async findAll(user: SimpleUserDto): Promise<Task[]> {
    return await this.taskRepository.find({
      where: { isDeleted: false, createdBy: user.id },
    });
  }

  async findOne(id: string, user: SimpleUserDto): Promise<TaskDto | null> {
    const task = await this.taskRepository.findOne({
      where: { id, isDeleted: false, createdBy: user.id },
      relations: ['creator'],
    });

    if (!task) return null;

    return plainToInstance(TaskDto, task, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: string,
    updateData: UpdateTaskDto,
    user: SimpleUserDto,
  ): Promise<Task | null> {
    const task = await this.findOne(id, user);
    if (!task) return null;

    Object.assign(task, updateData);
    return await this.taskRepository.save(task);
  }
}
