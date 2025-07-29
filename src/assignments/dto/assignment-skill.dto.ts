import { Expose, Type } from 'class-transformer';
import { SkillDto } from 'src/skills/dto/skill.dto';

export class AssignmentSkillDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => SkillDto)
  skill: SkillDto;
}
