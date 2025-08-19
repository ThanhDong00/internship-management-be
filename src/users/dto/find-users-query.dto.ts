import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class FindUsersQueryDto {
  @ApiPropertyOptional({
    enum: ['admin', 'mentor', 'intern'],
    description: 'Filter users by role',
    example: 'intern',
  })
  @IsOptional()
  @IsEnum(['admin', 'mentor', 'intern'], {
    message: 'Role must be one of: admin, mentor, intern',
  })
  role?: 'admin' | 'mentor' | 'intern';

  @ApiPropertyOptional()
  page: string = '1';

  @ApiPropertyOptional()
  limit: string = '5';

  @ApiPropertyOptional()
  search?: string;
}
