import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { CreateAssignmentDto } from 'src/assignments/dto/create-assignment.dto';

export class CreateTrainingPlanDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  extra?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  skills?: string[];

  @ApiProperty({ required: false, type: [CreateAssignmentDto] })
  @IsOptional()
  assignments?: CreateAssignmentDto[];
}
