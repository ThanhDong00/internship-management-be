import { Module } from '@nestjs/common';
import { TrainingPlansController } from './training-plans.controller';
import { TrainingPlansService } from './training-plans.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingPlan } from './entities/training-plan.entity';
import { TrainingPlanSkill } from './entities/training-plan-skill.entity';
import { Skill } from 'src/skills/entities/skill.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { InternInformation } from 'src/interns-information/entities/intern-information.entity';
import { AssignmentsModule } from 'src/assignments/assignments.module';
import { InternsInformationModule } from 'src/interns-information/interns-information.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainingPlan,
      TrainingPlanSkill,
      Skill,
      Assignment,
      InternInformation,
    ]),
    AssignmentsModule,
    InternsInformationModule,
  ],
  controllers: [TrainingPlansController],
  providers: [TrainingPlansService],
})
export class TrainingPlansModule {}
