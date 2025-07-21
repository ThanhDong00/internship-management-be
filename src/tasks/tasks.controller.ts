import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { User } from 'src/auth/decorators/user.decorator';
import { SimpleUserDto } from 'src/users/dto/simple-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Create a new task' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @User() user: SimpleUserDto,
  ) {
    try {
      return await this.tasksService.create(createTaskDto, user);
    } catch (error) {
      throw new InternalServerErrorException('Error creating task');
    }
  }

  @ApiOperation({ summary: 'Get all tasks' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Get()
  async findAll(@User() user: SimpleUserDto) {
    try {
      return await this.tasksService.findAll(user);
    } catch (error) {
      throw new InternalServerErrorException('Error fetching tasks');
    }
  }

  @ApiOperation({ summary: 'Get a task by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Get(':id')
  async findOne(@Param('id') id: string, @User() user: SimpleUserDto) {
    try {
      const task = await this.tasksService.findOne(id, user);

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      return task;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error fetching task');
    }
  }

  @ApiOperation({ summary: 'Update a task by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @User() user: SimpleUserDto,
  ) {
    try {
      const updatedTask = await this.tasksService.update(
        id,
        updateTaskDto,
        user,
      );

      if (!updatedTask) {
        throw new NotFoundException('Task not found');
      }

      return updatedTask;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error updating task');
    }
  }
}
