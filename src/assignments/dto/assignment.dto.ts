import { Exclude, Expose, Type } from 'class-transformer';
import { AssignmentSkillDto } from './assignment-skill.dto';
import { TaskDto } from 'src/tasks/dto/task.dto';

export class AssignmentDto {
  @Expose()
  id: string;

  @Expose()
  planId: string;

  @Expose()
  taskId: string;

  @Expose()
  @Type(() => TaskDto)
  task: TaskDto;

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
  isDeleted: boolean;

  @Exclude()
  isAssigned: boolean;
}
