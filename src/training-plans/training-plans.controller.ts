import {
  BadRequestException,
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
import { TrainingPlansService } from './training-plans.service';
import { CreateTrainingPlanDto } from './dto/create-training-plan.dto';
import { User } from 'src/auth/decorators/user.decorator';
import { SimpleUserDto } from 'src/users/dto/simple-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateTrainingPlanDto } from './dto/update-training-plan.dto';

@Controller('training-plans')
export class TrainingPlansController {
  constructor(private readonly trainingPlansService: TrainingPlansService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Post()
  async create(
    @Body() createTrainingPlanDto: CreateTrainingPlanDto,
    @User() user: SimpleUserDto,
  ) {
    try {
      return this.trainingPlansService.createTrainingPlan(
        createTrainingPlanDto,
        user,
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to create training plan');
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Get()
  async findAllByUser(@User() user: SimpleUserDto) {
    return this.trainingPlansService.findAllByUser(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  async findAll() {
    return this.trainingPlansService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Get(':id')
  async findOne(@Param('id') id: string, @User() user: SimpleUserDto) {
    try {
      const trainingPlan = await this.trainingPlansService.findOne(id, user);

      if (!trainingPlan) {
        throw new NotFoundException('Training plan not found');
      }

      return trainingPlan;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to retrieve training plan',
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTrainingPlanDto: UpdateTrainingPlanDto,
    @User() user: SimpleUserDto,
  ) {
    try {
      return this.trainingPlansService.update(id, updateTrainingPlanDto, user);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update training plan');
    }
  }
}
