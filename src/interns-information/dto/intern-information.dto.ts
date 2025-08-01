import { Exclude, Expose, Type } from 'class-transformer';
import { TrainingPlanDto } from 'src/training-plans/dto/training-plan.dto';
import { UserDto } from 'src/users/dto/user.dto';

export class InternInformationDto {
  @Expose()
  id: string;

  @Expose()
  field: string;

  @Expose()
  internId: string;

  @Expose()
  @Type(() => UserDto)
  intern: UserDto;

  @Expose()
  mentorId: string;

  @Expose()
  @Type(() => UserDto)
  mentor: UserDto;

  @Expose()
  planId: string;

  @Expose()
  @Type(() => TrainingPlanDto)
  plan: TrainingPlanDto;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;

  @Expose()
  status: string;

  @Exclude()
  isDeleted: boolean;
}
