import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
      throw new InternalServerErrorException(
        'Error creating skill: ' + error.message,
      );
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
      throw new InternalServerErrorException(
        'Error fetching all skills: ' + error.message,
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
      throw new InternalServerErrorException(
        'Error fetching skills by user ID: ' + error.message,
      );
    }
  }

  /**
   * Finds a skill by its ID. If the user is an admin, it returns the skill regardless of who created it.
   * @param id - id of the skill to find
   * @param user - user object containing role and id
   * @returns SkillDto or null if not found
   */
  async findOne(id: string, user: any): Promise<SkillDto> {
    try {
      const whereCondition: any = {
        id: id,
        isDeleted: false,
      };

      if (user.role !== 'admin') {
        whereCondition.createdBy = user.id;
      }

      const skill = await this.skillRepository.findOne({
        where: whereCondition,
      });

      if (!skill) {
        throw new NotFoundException(`Skill with ID ${id} not found`);
      }

      return plainToInstance(SkillDto, skill, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error fetching skill by ID: ' + error.message,
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
      throw new InternalServerErrorException(
        'Error fetching skill by ID and user ID: ' + error.message,
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

      if (user.role !== 'admin' && user.id !== skill.createdBy) {
        throw new ForbiddenException(
          `You are not the owner of this skill or the admin`,
        );
      }

      const updatedSkill = await this.skillRepository.save({
        ...skill,
        ...updateSkillDto,
      });

      return plainToInstance(SkillDto, updatedSkill);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error updating skill: ' + error.message,
      );
    }
  }

  remove(id: string) {
    return `This action removes a #${id} skill`;
  }
}
