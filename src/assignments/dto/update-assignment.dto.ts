import { PartialType } from '@nestjs/swagger';
import { CreateAssignmentDto } from './create-assignment.dto';

export class UpdateAssignmentDto {
  taskId?: string;
  dueDate?: Date;
  estimatedTime?: number;
  status?: 'Todo' | 'InProgress' | 'Submitted' | 'Reviewed';
  skillIds?: string[];
}
