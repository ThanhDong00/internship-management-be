import { Exclude, Expose, Type } from 'class-transformer';
import { SkillDto } from 'src/skills/dto/skill.dto';

export class TrainingPlanSkillDto {
  @Expose()
  id: string;

  @Expose()
  planId: string;

  @Exclude()
  skillId: string;

  @Exclude()
  isDeleted: boolean;

  @Expose()
  @Type(() => SkillDto)
  skill: SkillDto;
}
