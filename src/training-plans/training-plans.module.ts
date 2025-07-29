import { Module } from '@nestjs/common';
import { TrainingPlansController } from './training-plans.controller';
import { TrainingPlansService } from './training-plans.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingPlan } from './entities/training-plan.entity';
import { TrainingPlanSkill } from './entities/training-plan-skill.entity';
import { Skill } from 'src/skills/entities/skill.entity';
import { AssignmentsModule } from 'src/assignments/assignments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainingPlan, TrainingPlanSkill, Skill]),
    AssignmentsModule,
  ],
  controllers: [TrainingPlansController],
  providers: [TrainingPlansService],
})
export class TrainingPlansModule {}
