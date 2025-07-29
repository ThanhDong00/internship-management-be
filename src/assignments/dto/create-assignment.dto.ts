import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty()
  @IsOptional()
  @IsUUID('4', { message: 'Invalid planId format' })
  planId: string;

  @ApiProperty()
  @IsNotEmpty()
  skillIds: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid taskId format' })
  taskId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsPositive({ message: 'Estimated time must be positive' })
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
