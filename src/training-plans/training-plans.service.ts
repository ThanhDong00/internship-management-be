import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrainingPlan } from './entities/training-plan.entity';
import { DataSource, Repository } from 'typeorm';
import { TrainingPlanSkill } from './entities/training-plan-skill.entity';
import { CreateTrainingPlanDto } from './dto/create-training-plan.dto';
import { SimpleUserDto } from 'src/users/dto/simple-user.dto';
import { Skill } from 'src/skills/entities/skill.entity';
import { UpdateTrainingPlanDto } from './dto/update-training-plan.dto';

@Injectable()
export class TrainingPlansService {
  constructor(
    @InjectRepository(TrainingPlan)
    private readonly trainingPlanRepository: Repository<TrainingPlan>,
    @InjectRepository(TrainingPlanSkill)
    private readonly trainingPlanSkillRepository: Repository<TrainingPlanSkill>,
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<TrainingPlan[]> {
    try {
      const trainingPlans = await this.trainingPlanRepository.find({
        where: {
          isDeleted: false,
        },
        relations: ['skills', 'skills.skill'],
      });

      return trainingPlans;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching training plans: ' + error.message,
      );
    }
  }

  async findAllByUser(userId: string): Promise<TrainingPlan[]> {
    try {
      const trainingPlans = await this.trainingPlanRepository.find({
        where: {
          isDeleted: false,
          createdBy: userId,
        },
        relations: ['skills', 'skills.skill'],
      });

      return trainingPlans;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching training plans: ' + error.message,
      );
    }
  }

  async findOne(id: string, user: SimpleUserDto): Promise<TrainingPlan> {
    try {
      const trainingPlan = await this.trainingPlanRepository.findOne({
        where: {
          id,
          isDeleted: false,
        },
        relations: ['skills', 'skills.skill'],
      });

      if (!trainingPlan) {
        throw new NotFoundException(`Training plan ${id} not found`);
      }

      if (user.role !== 'admin' && user.id !== trainingPlan.createdBy) {
        throw new ForbiddenException(
          'You do not have permission to access this training plan',
        );
      }

      return trainingPlan;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error fetching training plan: ' + error.message,
      );
    }
  }

  async createTrainingPlan(
    createTrainingPlanDto: CreateTrainingPlanDto,
    user: SimpleUserDto,
  ): Promise<TrainingPlan> {
    try {
      const { skills, ...createData } = createTrainingPlanDto;

      if (skills && skills.length > 0) {
        await this.validateSkillsExist(skills);
      }

      return await this.dataSource.transaction(async (manager) => {
        const trainingPlan = manager.create(TrainingPlan, {
          ...createData,
          createdBy: user.id,
        });

        const savedTrainingPlan = await manager.save(
          TrainingPlan,
          trainingPlan,
        );

        if (skills && skills.length > 0) {
          const trainingPlanSkills = skills.map((skillId) =>
            manager.create(TrainingPlanSkill, {
              planId: savedTrainingPlan.id,
              skillId: skillId,
            }),
          );

          await manager.save(TrainingPlanSkill, trainingPlanSkills);
        }

        const trainingPlanWithSkills = await manager.findOne(TrainingPlan, {
          where: {
            id: savedTrainingPlan.id,
            isDeleted: false,
          },
          relations: ['skills', 'skills.skill'],
        });

        if (!trainingPlanWithSkills) {
          throw new Error('Failed to create training plan with skills');
        }

        return trainingPlanWithSkills;
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating training plan: ' + error.message,
      );
    }
  }

  private async validateSkillsExist(skills: string[]) {
    const existingSkills = await this.skillRepository.find({
      where: skills.map((id) => ({ id, isDeleted: false })),
      select: ['id'],
    });

    const existingSkillIds = existingSkills.map((skill) => skill.id);
    const missingSkillIds = skills.filter(
      (id) => !existingSkillIds.includes(id),
    );

    if (missingSkillIds.length > 0) {
      throw new BadRequestException(
        `Skills not found: ${missingSkillIds.join(', ')}`,
      );
    }
  }

  async update(
    id: string,
    updateData: UpdateTrainingPlanDto,
    user: SimpleUserDto,
  ): Promise<TrainingPlan> {
    try {
      const existingTrainingPlan = await this.findOne(id, user);

      if (!existingTrainingPlan) {
        throw new NotFoundException(`Training plan ${id} not found`);
      }

      if (
        user.role === 'mentor' &&
        existingTrainingPlan.createdBy !== user.id
      ) {
        throw new ForbiddenException(
          'You do not have permission to update this training plan',
        );
      }

      const { skills, ...updatePlanData } = updateData;

      if (skills && skills.length > 0) {
        await this.validateSkillsExist(skills);
      }

      const updatedTrainingPlanId = await this.dataSource.transaction(
        async (manager) => {
          Object.assign(existingTrainingPlan, updatePlanData);
          await manager.save(TrainingPlan, existingTrainingPlan);

          if (skills && skills.length > 0) {
            await manager.delete(TrainingPlanSkill, {
              planId: existingTrainingPlan.id,
            });

            const trainingPlanSkills = skills.map((skillId) =>
              manager.create(TrainingPlanSkill, {
                planId: existingTrainingPlan.id,
                skillId: skillId,
              }),
            );
            await manager.save(TrainingPlanSkill, trainingPlanSkills);
          }

          return existingTrainingPlan.id;
        },
      );

      const updatedTrainingPlan = await this.findOne(
        updatedTrainingPlanId,
        user,
      );

      if (!updatedTrainingPlan) {
        throw new NotFoundException(
          `Error when updating: Training plan ${updatedTrainingPlanId} not found`,
        );
      }

      return updatedTrainingPlan;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error updating training plan: ' + error.message,
      );
    }
  }
}
