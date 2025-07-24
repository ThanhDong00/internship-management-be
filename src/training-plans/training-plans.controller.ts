import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TrainingPlansService } from './training-plans.service';
import { CreateTrainingPlanDto } from './dto/create-training-plan.dto';
import { User } from 'src/auth/decorators/user.decorator';
import { SimpleUserDto } from 'src/users/dto/simple-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

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
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const trainingPlan = await this.trainingPlansService.findOne(id);

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
}
