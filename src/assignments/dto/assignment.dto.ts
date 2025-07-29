import { Exclude } from 'class-transformer';
import { AssignmentSkillDto } from './assignment-skill.dto';

export class AssignmentDto {
  id: string;
  planId: string;
  taskId: string;
  skills: AssignmentSkillDto[];
  createdBy: string;
  assignedTo?: string;
  estimatedTime: number;
  dueDate: Date;
  submittedLink?: string;
  submittedAt?: Date;
  feedback?: string;
  status: 'Todo' | 'InProgress' | 'Submitted' | 'Reviewed';

  @Exclude()
  isDeleted?: boolean;
}
