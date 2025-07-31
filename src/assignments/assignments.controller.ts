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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('assignments')
@ApiBearerAuth()
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @ApiOperation({ summary: 'Create a new assignment' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Post()
  async create(
    @Body() payLoad: CreateAssignmentDto,
    @User() user: SimpleUserDto,
  ) {
    return this.assignmentsService.create(payLoad, user);
  }

  @ApiOperation({ summary: 'Get all assignments' })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@User() user: SimpleUserDto) {
    return this.assignmentsService.findAll(user);
  }

  @ApiOperation({ summary: 'Get a single assignment by ID' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @User() user: SimpleUserDto) {
    return this.assignmentsService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Update assignment status' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('intern')
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @User() user: SimpleUserDto) {
    return this.assignmentsService.updateStatus(id, user);
  }

  @ApiOperation({ summary: 'Submit an assignment' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        submittedLink: { type: 'string' },
      },
      required: ['submittedLink'],
    },
  })
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

  @ApiOperation({ summary: 'Review an assignment' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        feedback: { type: 'string' },
      },
      required: ['feedback'],
    },
  })
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

  @ApiOperation({ summary: 'Update an assignment' })
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

  @ApiOperation({ summary: 'Delete an assignment' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Delete(':id')
  async delete(@Param('id') id: string, @User() user: SimpleUserDto) {
    return this.assignmentsService.delete(id, user);
  }
}
