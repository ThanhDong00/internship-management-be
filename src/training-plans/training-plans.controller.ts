import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TrainingPlansService } from './training-plans.service';
import { CreateTrainingPlanDto } from './dto/create-training-plan.dto';
import { User } from 'src/auth/decorators/user.decorator';
import { SimpleUserDto } from 'src/users/dto/simple-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateTrainingPlanDto } from './dto/update-training-plan.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('training-plans')
@ApiBearerAuth()
@Controller('training-plans')
export class TrainingPlansController {
  constructor(private readonly trainingPlansService: TrainingPlansService) {}

  @ApiOperation({ summary: 'Create a training plan' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Post()
  async create(
    @Body() createTrainingPlanDto: CreateTrainingPlanDto,
    @User() user: SimpleUserDto,
  ) {
    return this.trainingPlansService.createTrainingPlan(
      createTrainingPlanDto,
      user,
    );
  }

  @ApiOperation({
    summary: 'Get all training plans for the authenticated user',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Get()
  async findAllByUser(@User() user: SimpleUserDto) {
    return this.trainingPlansService.findAllByUser(user.id);
  }

  @ApiOperation({ summary: 'Get all training plans' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  async findAll() {
    return this.trainingPlansService.findAll();
  }

  // @ApiOperation({ summary: 'Get training plans for Interns' })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('intern')
  // @Get('interns')
  // async findPlansForInterns(@User() user: SimpleUserDto) {
  //   return await this.trainingPlansService.findPlansForInterns(user);
  // }

  @ApiOperation({ summary: 'Get all training plans with interns' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Get('with-interns')
  async findAllWithInterns(@User() user: SimpleUserDto) {
    return await this.trainingPlansService.findPlansWithInterns(user);
  }

  @ApiOperation({ summary: 'Get a training plan by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Get(':id')
  async findOne(@Param('id') id: string, @User() user: SimpleUserDto) {
    return await this.trainingPlansService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Assign a training plan to an intern' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        internId: { type: 'string' },
      },
      required: ['internId'],
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Put(':id/assign')
  async assign(
    @Param('id') id: string,
    @User() user: SimpleUserDto,
    @Body('internId') internId: string,
  ) {
    return await this.trainingPlansService.assignTrainingPlanToIntern(
      id,
      internId,
      user,
    );
  }

  @ApiOperation({ summary: 'Restore a training plan with Id' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Put(':id/restore')
  async restore(@Param('id') id: string, @User() user: SimpleUserDto) {
    return this.trainingPlansService.restore(id, user);
  }

  @ApiOperation({ summary: 'Update a training plan by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTrainingPlanDto: UpdateTrainingPlanDto,
    @User() user: SimpleUserDto,
  ) {
    return this.trainingPlansService.update(id, updateTrainingPlanDto, user);
  }

  @ApiOperation({ summary: 'Delete a training plan with Id' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Delete(':id')
  async softDelete(@Param('id') id: string, @User() user: SimpleUserDto) {
    return this.trainingPlansService.softDelete(id, user);
  }
}
