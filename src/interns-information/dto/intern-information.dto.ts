import { Exclude, Expose } from 'class-transformer';

export class InternInformationDto {
  @Expose()
  id: string;

  @Expose()
  field: string;

  @Expose()
  internId: string;

  @Expose()
  mentorId: string;

  @Expose()
  planId: string;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;

  @Expose()
  status: string;

  @Exclude()
  isDeleted: boolean;
}
