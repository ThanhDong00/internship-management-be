import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

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
}
