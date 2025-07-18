import { Exclude, Expose } from 'class-transformer';

export class SkillDto {
  id: string;

  name: string;

  description: string;

  createdBy: string;

  @Exclude()
  isDeleted: boolean;
}
