import { Exclude, Expose } from 'class-transformer';
import { AssignmentSkillDto } from './assignment-skill.dto';

export class AssignmentDto {
  @Expose()
  id: string;

  @Expose()
  planId: string;

  @Expose()
  taskId: string;

  @Expose()
  skills: AssignmentSkillDto[];

  @Expose()
  createdBy: string;

  @Expose()
  assignedTo?: string;

  @Expose()
  estimatedTime: number;

  @Expose()
  dueDate?: Date;

  @Expose()
  submittedLink?: string;

  @Expose()
  submittedAt?: Date;

  @Expose()
  feedback?: string;

  @Expose()
  status: 'Todo' | 'InProgress' | 'Submitted' | 'Reviewed';

  @Exclude()
  isDeleted?: boolean;
}
