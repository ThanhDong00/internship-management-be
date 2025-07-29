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
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { AssignmentSkill } from 'src/assignments/entities/assignment-skill.entity';
import { TrainingPlanDto } from './dto/training-plan.dto';
import { plainToInstance } from 'class-transformer';
import { InternInformation } from 'src/interns-information/entities/intern-information.entity';
import { InternsInformationService } from 'src/interns-information/interns-information.service';

@Injectable()
export class TrainingPlansService {
  constructor(
    @InjectRepository(TrainingPlan)
    private readonly trainingPlanRepository: Repository<TrainingPlan>,

    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,

    @InjectRepository(InternInformation)
    private readonly internInformationRepository: Repository<InternInformation>,

    private readonly internsInformationService: InternsInformationService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<TrainingPlanDto[]> {
    try {
      const trainingPlans = await this.trainingPlanRepository.find({
        where: {
          isDeleted: false,
        },
        relations: [
          'skills',
          'skills.skill',
          'assignments',
          'assignments.task',
        ],
      });

      return plainToInstance(TrainingPlanDto, trainingPlans, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching training plans: ' + error.message,
      );
    }
  }

  async findAllByUser(userId: string): Promise<TrainingPlanDto[]> {
    try {
      const trainingPlans = await this.trainingPlanRepository.find({
        where: {
          isDeleted: false,
          createdBy: userId,
        },
        relations: [
          'skills',
          'skills.skill',
          'assignments',
          'assignments.task',
        ],
      });

      return plainToInstance(TrainingPlanDto, trainingPlans, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching training plans: ' + error.message,
      );
    }
  }

  async findOne(id: string, user: SimpleUserDto): Promise<TrainingPlanDto> {
    try {
      const trainingPlan = await this.trainingPlanRepository.findOne({
        where: {
          id,
          isDeleted: false,
        },
        relations: [
          'skills',
          'skills.skill',
          'assignments',
          'assignments.task',
        ],
      });

      if (!trainingPlan) {
        throw new NotFoundException(`Training plan ${id} not found`);
      }

      if (user.role !== 'admin' && user.id !== trainingPlan.createdBy) {
        throw new ForbiddenException(
          'You do not have permission to access this training plan',
        );
      }

      return plainToInstance(TrainingPlanDto, trainingPlan, {
        excludeExtraneousValues: true,
      });
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
  ): Promise<TrainingPlanDto> {
    try {
      const { assignments, skills, ...createData } = createTrainingPlanDto;

      if (skills && skills.length > 0) {
        await this.validateSkillsExist(skills);
      }

      if (assignments && assignments.length > 0) {
        await this.validateAssignmentsData(assignments);
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

        if (assignments && assignments.length > 0) {
          for (const assignmentDto of assignments) {
            const assignmentWithPlanId = {
              ...assignmentDto,
              planId: savedTrainingPlan.id,
              createdBy: user.id,
            };

            const assignment = manager.create(Assignment, assignmentWithPlanId);
            const savedAssignment = await manager.save(Assignment, assignment);

            if (assignmentDto.skillIds && assignmentDto.skillIds.length > 0) {
              const assignmentSkills = assignmentDto.skillIds.map((skillId) =>
                manager.create(AssignmentSkill, {
                  assignmentId: savedAssignment.id,
                  skillId: skillId,
                }),
              );
              await manager.save(AssignmentSkill, assignmentSkills);
            }
          }
        }

        const trainingPlanWithSkills = await manager.findOne(TrainingPlan, {
          where: {
            id: savedTrainingPlan.id,
            isDeleted: false,
          },
          relations: [
            'skills',
            'skills.skill',
            'assignments',
            'assignments.task',
          ],
        });

        if (!trainingPlanWithSkills) {
          throw new Error('Failed to create training plan with skills');
        }

        return plainToInstance(TrainingPlanDto, trainingPlanWithSkills, {
          excludeExtraneousValues: true,
        });
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

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

  private async validateAssignmentsData(assignments: any[]) {
    for (const assignment of assignments) {
      // Validate taskId exists
      // You might want to add Task repository and check if task exists
      if (!assignment.taskId) {
        throw new BadRequestException('Task ID is required for assignment');
      }

      // Validate skills if provided
      if (assignment.skillIds && assignment.skillIds.length > 0) {
        await this.validateSkillsExist(assignment.skillIds);
      }

      // Validate estimatedTime is positive
      if (assignment.estimatedTime <= 0) {
        throw new BadRequestException('Estimated time must be greater than 0');
      }
    }
  }

  async update(
    id: string,
    updateData: UpdateTrainingPlanDto,
    user: SimpleUserDto,
  ): Promise<TrainingPlanDto> {
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

  async assignTrainingPlanToIntern(
    id: string,
    internId: string,
    user: SimpleUserDto,
  ) {
    try {
      await this.dataSource.transaction(async (manager) => {
        const trainingPlan = await manager.findOne(TrainingPlan, {
          where: {
            id: id,
            isDeleted: false,
          },
        });

        if (!trainingPlan) {
          throw new NotFoundException(`Training plan ${id} not found`);
        }

        if (user.role !== 'admin' && user.id !== trainingPlan.createdBy) {
          throw new ForbiddenException(
            'You do not have permission to assign this training plan',
          );
        }

        const internsInfo =
          await this.internsInformationService.findByInternId(internId);

        if (!internsInfo) {
          throw new NotFoundException(`Intern ${internId} not found`);
        }

        internsInfo.planId = id;
        await manager.save(InternInformation, internsInfo);

        // change Assignment's assignedTo to the internId
        const assignmentsToUpdate = await manager.find(Assignment, {
          where: {
            planId: id,
          },
        });

        for (const assignment of assignmentsToUpdate) {
          assignment.assignedTo = internId;
          assignment.dueDate = internsInfo.endDate;
          await manager.save(Assignment, assignment);
        }
      });

      return { message: 'Training plan assigned to intern successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error assigning training plan');
    }
  }
}
