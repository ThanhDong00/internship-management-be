import { Exclude, Expose } from 'class-transformer';

export class SkillDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  createdBy: string;

  @Exclude()
  isDeleted: boolean;
}
