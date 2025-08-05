import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SimpleUserDto } from 'src/users/dto/simple-user.dto';
import { TaskDto } from './dto/task.dto';
import { plainToInstance } from 'class-transformer';
import { Assignment } from 'src/assignments/entities/assignment.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,

    private readonly dataSource: DataSource,
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

  async findAllByUser(user: SimpleUserDto): Promise<TaskDto[]> {
    try {
      const tasks = await this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.creator', 'creator')
        .where('task.isDeleted = false AND task.createdBy = :userId', {
          userId: user.id,
        })
        .select([
          'task.id',
          'task.name',
          'task.description',
          'creator.id',
          'creator.fullName',
        ])
        .getMany();

      return plainToInstance(TaskDto, tasks, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching tasks: ' + error.message,
      );
    }
  }

  async findAll(): Promise<TaskDto[]> {
    try {
      const tasks = await this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.creator', 'creator')
        .where('task.isDeleted = false')
        .select([
          'task.id',
          'task.name',
          'task.description',
          'creator.id',
          'creator.fullName',
        ])
        .getMany();

      return plainToInstance(TaskDto, tasks, {
        excludeExtraneousValues: true,
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
        select: {
          creator: {
            id: true,
            fullName: true,
          },
        },
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

  async softDelete(id: string, user: SimpleUserDto): Promise<any> {
    try {
      const whereCondition: any = {
        id: id,
        isDeleted: false,
      };

      if (user.role !== 'admin') {
        whereCondition.createdBy = user.id;
      }

      const task = await this.taskRepository.findOne({
        where: whereCondition,
      });

      if (!task) throw new NotFoundException('Task not found');

      await this.checkTaskReferences(id);

      await this.taskRepository.update(id, { isDeleted: true });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error deleting task: ' + error.message,
      );
    }
  }

  private async checkTaskReferences(taskId: string): Promise<void> {
    const references: string[] = [];

    const assignmentCount = await this.dataSource
      .getRepository(Assignment)
      .createQueryBuilder('assignment')
      .where('assignment.taskId = :taskId', { taskId })
      .andWhere('assignment.isDeleted = false')
      .getCount();

    if (assignmentCount > 0) {
      references.push(`${assignmentCount} assignment(s)`);
    }

    if (references.length > 0) {
      throw new BadRequestException(
        `Cannot delete task. It is being used in: ${references.join(', ')}. Please remove the task from these entities first.`,
      );
    }
  }

  async restore(id: string, user: SimpleUserDto): Promise<TaskDto> {
    try {
      const whereCondition: any = {
        id: id,
        isDeleted: true,
      };

      if (user.role !== 'admin') {
        whereCondition.createdBy = user.id;
      }

      const task = await this.taskRepository.findOne({
        where: whereCondition,
      });

      if (!task) throw new NotFoundException('Task not found');

      await this.taskRepository.update(id, { isDeleted: false });

      const restoredTask = await this.taskRepository.findOne({
        where: { id, isDeleted: false },
      });

      return plainToInstance(TaskDto, restoredTask, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error restoring task: ' + error.message,
      );
    }
  }

  async getTaskUsage(id: string, user: SimpleUserDto): Promise<any> {
    try {
      const whereCondition: any = {
        id: id,
        isDeleted: false,
      };

      if (user.role !== 'admin') {
        whereCondition.createdBy = user.id;
      }

      const task = await this.taskRepository.findOne({
        where: whereCondition,
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      // Lấy chi tiết assignments đang sử dụng task này
      const assignmentUsage = await this.dataSource
        .getRepository('Assignment')
        .createQueryBuilder('assignment')
        .leftJoin('assignment.assignee', 'assignee')
        .where('assignment.taskId = :taskId', { taskId: id })
        .andWhere('assignment.isDeleted = false')
        .select([
          'assignment.id',
          'assignment.status',
          'assignee.username as assigneeName',
        ])
        .getRawMany();

      return {
        assignments: assignmentUsage,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error getting task usage: ' + error.message,
      );
    }
  }
}
