import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { Not, Repository } from 'typeorm';
import { SkillDto } from './dto/skill.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  async create(
    createSkillDto: CreateSkillDto,
    createdBy: string,
  ): Promise<SkillDto> {
    try {
      const skill = await this.skillRepository.save({
        ...createSkillDto,
        createdBy,
      });
      return plainToInstance(SkillDto, skill);
    } catch (error) {
      console.log('Error creating skill:', error);
      throw new HttpException('Error creating skill: ' + error.message, 500);
    }
  }

  async findAll(): Promise<SkillDto[]> {
    try {
      const skills = await this.skillRepository.find({
        where: {
          isDeleted: false,
        },
      });
      return plainToInstance(SkillDto, skills);
    } catch (error) {
      console.log('Error fetching all skills:', error);
      throw new HttpException(
        'Error fetching all skills: ' + error.message,
        500,
      );
    }
  }

  async findAllByUserId(userId: string): Promise<SkillDto[]> {
    try {
      const skills = await this.skillRepository.find({
        where: {
          createdBy: userId,
          isDeleted: false,
        },
      });
      return plainToInstance(SkillDto, skills);
    } catch (error) {
      console.log('Error fetching skills by user ID:', error);
      throw new HttpException(
        'Error fetching skills by user ID: ' + error.message,
        500,
      );
    }
  }

  /**
   * Finds a skill by its ID. If the user is an admin, it returns the skill regardless of who created it.
   * @param id - id of the skill to find
   * @param user - user object containing role and id
   * @returns SkillDto or null if not found
   */
  async findOne(id: string, user: any): Promise<SkillDto | null> {
    try {
      if (user.role === 'admin') {
        const skill = await this.skillRepository.findOne({
          where: {
            id: id,
            isDeleted: false,
          },
        });
        return plainToInstance(SkillDto, skill);
      } else {
        const skill = await this.skillRepository.findOne({
          where: {
            id: id,
            isDeleted: false,
            createdBy: user.id,
          },
        });
        return plainToInstance(SkillDto, skill);
      }
    } catch (error) {
      console.log('Error fetching skill by ID:', error);
      throw new HttpException(
        'Error fetching skill by ID: ' + error.message,
        500,
      );
    }
  }

  async findOneById(id: string, userId: string): Promise<SkillDto | null> {
    try {
      const skill = await this.skillRepository.findOne({
        where: {
          id: id,
          createdBy: userId,
          isDeleted: false,
        },
      });
      return plainToInstance(SkillDto, skill);
    } catch (error) {
      console.log('Error fetching skill by ID and user ID:', error);
      throw new HttpException(
        'Error fetching skill by ID and user ID: ' + error.message,
        500,
      );
    }
  }

  async update(
    id: string,
    updateSkillDto: UpdateSkillDto,
    user: any,
  ): Promise<SkillDto | null> {
    try {
      const skill = await this.skillRepository.findOne({
        where: {
          id: id,
          isDeleted: false,
        },
      });

      if (!skill) {
        throw new NotFoundException(`Skill with ID ${id} not found`);
      }

      if (user.role === 'admin' || skill.createdBy === user.id) {
        const updatedSkill = await this.skillRepository.save({
          ...skill,
          ...updateSkillDto,
        });

        return plainToInstance(SkillDto, updatedSkill);
      }

      return null;
    } catch (error) {
      console.log('Error updating skill:', error);
      throw new HttpException('Error updating skill: ' + error.message, 500);
    }
  }

  remove(id: string) {
    return `This action removes a #${id} skill`;
  }
}
