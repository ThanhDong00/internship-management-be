import { ApiProperty } from '@nestjs/swagger';

export class CreateInternInformationDto {
  @ApiProperty({ required: false })
  field?: string;

  @ApiProperty()
  internId: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;
}
