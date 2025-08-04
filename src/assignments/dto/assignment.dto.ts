import { Exclude, Expose, Type } from 'class-transformer';
import { AssignmentSkillDto } from './assignment-skill.dto';
import { TaskDto } from 'src/tasks/dto/task.dto';
import { UserDto } from 'src/users/dto/user.dto';

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
  @Type(() => AssignmentSkillDto)
  skills: AssignmentSkillDto[];

  @Expose()
  createdBy: string;

  @Expose()
  assignedTo?: string;

  @Expose()
  @Type(() => UserDto)
  assignee: UserDto;

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

  @Expose()
  isAssigned: boolean;
}
