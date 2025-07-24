import {
  BadRequestException,
  Injectable,
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
    const trainingPlans = await this.trainingPlanRepository.find({
      where: {
        isDeleted: false,
      },
      relations: ['skills', 'skills.skill'],
    });

    return trainingPlans;
  }

  async findAllByUser(userId: string): Promise<TrainingPlan[]> {
    const trainingPlans = await this.trainingPlanRepository.find({
      where: {
        isDeleted: false,
        createdBy: userId,
      },
      relations: ['skills', 'skills.skill'],
    });

    return trainingPlans;
  }

  async findOne(id: string, user: SimpleUserDto): Promise<TrainingPlan | null> {
    const trainingPlan = await this.trainingPlanRepository.findOne({
      where: {
        id,
        isDeleted: false,
      },
      relations: ['skills', 'skills.skill'],
    });

    if (!trainingPlan) {
      return null;
    }

    if (user.role === 'admin' || trainingPlan.createdBy === user.id) {
      return trainingPlan;
    }

    return null;
  }

  async createTrainingPlan(
    createTrainingPlanDto: CreateTrainingPlanDto,
    user: SimpleUserDto,
  ): Promise<TrainingPlan> {
    const { skills, ...createData } = createTrainingPlanDto;

    if (skills && skills.length > 0) {
      await this.validateSkillsExist(skills);
    }

    // Transaction
    return await this.dataSource.transaction(async (manager) => {
      const trainingPlan = manager.create(TrainingPlan, {
        ...createData,
        createdBy: user.id,
      });

      const savedTrainingPlan = await manager.save(TrainingPlan, trainingPlan);

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
    const existingTrainingPlan = await this.findOne(id, user);

    if (!existingTrainingPlan) {
      throw new NotFoundException(`Training plan not found`);
    }

    // use transaction to update training plan and its skills

    // temporary return
    return existingTrainingPlan;
  }
}
