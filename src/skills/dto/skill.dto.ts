import { Exclude, Expose } from 'class-transformer';

export class SkillDto {
  id: string;

  name: string;

  description: string;

  @Exclude()
  isDeleted: boolean;
}
