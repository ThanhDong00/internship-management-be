import { Exclude } from 'class-transformer';

export class AssignmentDto {
  id: string;
  planId: string;
  taskId: string;
  skillId: string;
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
