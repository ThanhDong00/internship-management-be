import { Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { Repository } from 'typeorm';
import { SkillDto } from './dto/skill.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  async create(createSkillDto: CreateSkillDto): Promise<SkillDto> {
    const skill = await this.skillRepository.save(createSkillDto);
    return plainToInstance(SkillDto, skill);
  }

  async findAll(): Promise<SkillDto[]> {
    const skills = await this.skillRepository.find({
      where: {
        is_deleted: false,
      },
    });
    return plainToInstance(SkillDto, skills);
  }

  async findOne(id: string): Promise<SkillDto | null> {
    const skill = await this.skillRepository.findOne({
      where: {
        id: id,
        is_deleted: false,
      },
    });
    return plainToInstance(SkillDto, skill);
  }

  update(id: string, updateSkillDto: UpdateSkillDto) {
    return `This action updates a #${id} skill`;
  }

  remove(id: string) {
    return `This action removes a #${id} skill`;
  }
}
