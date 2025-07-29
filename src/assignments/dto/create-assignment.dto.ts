import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid planId format' })
  planId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid skillId format' })
  skillIds: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid taskId format' })
  taskId: string;

  @ApiProperty()
  @IsNotEmpty()
  estimatedTime: number;

  @ApiProperty({ required: false })
  @IsOptional()
  assignedTo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  dueDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  submittedLink?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  feedback?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  status?: 'Todo' | 'InProgress' | 'Submitted' | 'Reviewed';
}
