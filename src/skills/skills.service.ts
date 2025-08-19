import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { DataSource, Not, Repository } from 'typeorm';
import { SkillDto } from './dto/skill.dto';
import { plainToInstance } from 'class-transformer';
import { SimpleUserDto } from 'src/users/dto/simple-user.dto';
import { AssignmentSkill } from 'src/assignments/entities/assignment-skill.entity';
import { TrainingPlanSkill } from 'src/training-plans/entities/training-plan-skill.entity';
import { GetSkillQueryDto } from './dto/get-skill-query.dto';

export interface IGetAllSkillResponse {
  skills: SkillDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,

    private readonly dataSource: DataSource,
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

  async findAll(query: GetSkillQueryDto): Promise<IGetAllSkillResponse> {
    try {
      const { page = 1, limit = 5, search } = query;

      const skip = (page - 1) * limit;

      const skillsQuery = this.skillRepository
        .createQueryBuilder('skill')
        .where('skill.isDeleted = false')
        .skip(skip)
        .take(limit);

      if (search) {
        skillsQuery.andWhere('skill.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      const skills = await skillsQuery.getMany();

      const totalItems = await skillsQuery.getCount();
      const totalPages = Math.ceil(totalItems / limit);

      return {
        skills: plainToInstance(SkillDto, skills),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching all skills: ' + error.message,
      );
    }
  }

  async findAllByUserId(
    userId: string,
    query: GetSkillQueryDto,
  ): Promise<IGetAllSkillResponse> {
    try {
      const { page = 1, limit = 5, search } = query;
      const skip = (page - 1) * limit;

      const skillsQuery = this.skillRepository
        .createQueryBuilder('skill')
        .where('skill.isDeleted = false')
        .andWhere('skill.createdBy = :userId', { userId })
        .skip(skip)
        .take(limit);

      if (search) {
        skillsQuery.andWhere('skill.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      const skills = await skillsQuery.getMany();

      const totalItems = await skillsQuery.getCount();
      const totalPages = Math.ceil(totalItems / limit);

      return {
        skills: plainToInstance(SkillDto, skills),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching skills by user ID: ' + error.message,
      );
    }
  }

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

  async softDelete(id: string, user: SimpleUserDto): Promise<void> {
    try {
      const whereCondition: any = {
        id: id,
        isDeleted: false,
      };

      const skill = await this.skillRepository.findOne({
        where: whereCondition,
      });

      if (!skill) {
        throw new NotFoundException(`Skill with ID ${id} not found`);
      }

      if (user.role !== 'admin' && user.id !== skill.createdBy) {
        throw new ForbiddenException(
          `You are not the owner of this skill or the admin`,
        );
      }

      await this.checkSkillReferences(id);

      await this.skillRepository.update(id, { isDeleted: true });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error soft deleting skill: ' + error.message,
      );
    }
  }

  private async checkSkillReferences(skillId: string): Promise<void> {
    const references: string[] = [];

    const assignmentSkillCount = await this.dataSource
      .getRepository(AssignmentSkill)
      .createQueryBuilder('assignmentSkill')
      .leftJoin('assignmentSkill.assignment', 'assignment')
      .where('assignmentSkill.skillId = :skillId', { skillId })
      .andWhere('assignment.isDeleted = false')
      .getCount();

    if (assignmentSkillCount > 0) {
      references.push(`${assignmentSkillCount} assignment(s)`);
    }

    const trainingPlanSkillCount = await this.dataSource
      .getRepository(TrainingPlanSkill)
      .createQueryBuilder('trainingPlanSkill')
      .leftJoin('trainingPlanSkill.plan', 'plan')
      .where('trainingPlanSkill.skillId = :skillId', { skillId })
      .andWhere('plan.isDeleted = false')
      .getCount();

    if (trainingPlanSkillCount > 0) {
      references.push(`${trainingPlanSkillCount} training plan(s)`);
    }

    if (references.length > 0) {
      throw new BadRequestException(
        `Cannot delete skill. It is being used in: ${references.join(', ')}. Please remove the skill from these entities first.`,
      );
    }
  }

  async restore(id: string, user: SimpleUserDto): Promise<SkillDto> {
    try {
      const whereCondition: any = {
        id: id,
        isDeleted: true,
      };

      if (user.role !== 'admin') {
        whereCondition.createdBy = user.id;
      }

      const skill = await this.skillRepository.findOne({
        where: whereCondition,
      });

      if (!skill) {
        throw new NotFoundException('Deleted skill not found');
      }

      await this.skillRepository.update(id, { isDeleted: false });

      const restoredSkill = await this.skillRepository.findOne({
        where: { id, isDeleted: false },
      });

      return plainToInstance(SkillDto, restoredSkill);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error restoring skill: ' + error.message,
      );
    }
  }

  async getSkillUsage(id: string, user: SimpleUserDto): Promise<any> {
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
        throw new NotFoundException('Skill not found');
      }

      // Lấy chi tiết usage
      const assignmentUsage = await this.dataSource
        .getRepository('AssignmentSkill')
        .createQueryBuilder('assignmentSkill')
        .leftJoin('assignmentSkill.assignment', 'assignment')
        .leftJoin('assignment.task', 'task')
        .where('assignmentSkill.skillId = :skillId', { skillId: id })
        .andWhere('assignment.isDeleted = false')
        .select(['assignment.id', 'task.name as taskName'])
        .getRawMany();

      const trainingPlanUsage = await this.dataSource
        .getRepository('TrainingPlanSkill')
        .createQueryBuilder('trainingPlanSkill')
        .leftJoin('trainingPlanSkill.plan', 'plan')
        .where('trainingPlanSkill.skillId = :skillId', { skillId: id })
        .andWhere('plan.isDeleted = false')
        .select(['plan.id', 'plan.name'])
        .getRawMany();

      return {
        assignments: assignmentUsage,
        trainingPlans: trainingPlanUsage,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error getting skill usage: ' + error.message,
      );
    }
  }
}
