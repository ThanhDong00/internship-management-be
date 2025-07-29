import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SimpleUserDto } from 'src/users/dto/simple-user.dto';
import { User } from 'src/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Post()
  async create(
    @Body() payLoad: CreateAssignmentDto,
    @User() user: SimpleUserDto,
  ) {
    return this.assignmentsService.create(payLoad, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@User() user: SimpleUserDto) {
    return this.assignmentsService.findAll(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @User() user: SimpleUserDto) {
    return this.assignmentsService.findOne(id, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('intern')
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @User() user: SimpleUserDto) {
    return this.assignmentsService.updateStatus(id, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('intern')
  @Put(':id/submit')
  async submit(
    @Param('id') id: string,
    @User() user: SimpleUserDto,
    @Body('submittedLink') payLoad: string,
  ) {
    return this.assignmentsService.submit(id, user, payLoad);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('mentor')
  @Put(':id/review')
  async review(
    @Param('id') id: string,
    @User() user: SimpleUserDto,
    @Body('feedback') payLoad: string,
  ) {
    return this.assignmentsService.review(id, user, payLoad);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @User() user: SimpleUserDto,
    @Body() payLoad: UpdateAssignmentDto,
  ) {
    return this.assignmentsService.update(id, user, payLoad);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Delete(':id')
  async delete(@Param('id') id: string, @User() user: SimpleUserDto) {
    return this.assignmentsService.delete(id, user);
  }
}
