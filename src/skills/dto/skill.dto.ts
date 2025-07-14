import { Exclude, Expose } from 'class-transformer';

export class SkillDto {
  id: string;

  name: string;

  description: string;

  @Exclude()
  is_deleted: boolean;
}
