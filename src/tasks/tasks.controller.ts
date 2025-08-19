import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
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
import { GetTaskQueryDto } from './dto/get-task-query.dto';

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
    return await this.tasksService.create(createTaskDto, user);
  }

  @ApiOperation({ summary: 'Get all tasks' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Get()
  async findAllByUser(
    @User() user: SimpleUserDto,
    @Query() query: GetTaskQueryDto,
  ) {
    return await this.tasksService.findAllByUser(user, query);
  }

  @ApiOperation({ summary: 'Get all tasks' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  async findAll(@Query() query: GetTaskQueryDto) {
    return await this.tasksService.findAll(query);
  }

  @ApiOperation({ summary: 'Get a task by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Get(':id')
  async findOne(@Param('id') id: string, @User() user: SimpleUserDto) {
    return await this.tasksService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Delete a task by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Delete(':id/soft-delete')
  async softDelete(@Param('id') id: string, @User() user: SimpleUserDto) {
    return await this.tasksService.softDelete(id, user);
  }

  @ApiOperation({ summary: 'Restore a soft-deleted task by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Put(':id/restore')
  async restore(@Param('id') id: string, @User() user: SimpleUserDto) {
    return await this.tasksService.restore(id, user);
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
    return await this.tasksService.update(id, updateTaskDto, user);
  }
}
