import { Exclude, Expose, Type } from 'class-transformer';
import { TrainingPlanSkillDto } from './training-plan-skill.dto';
import { AssignmentDto } from 'src/assignments/dto/assignment.dto';

export class TrainingPlanDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  extra?: string;

  @Expose()
  createdBy: string;

  @Exclude()
  isPublic: boolean;

  @Exclude()
  isDeleted: boolean;

  @Expose()
  @Type(() => TrainingPlanSkillDto)
  skills: TrainingPlanSkillDto[];

  @Expose()
  @Type(() => AssignmentDto)
  assignments?: AssignmentDto[];
}
