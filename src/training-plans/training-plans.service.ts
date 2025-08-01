import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrainingPlan } from './entities/training-plan.entity';
import { DataSource, In, IsNull, Not, Repository } from 'typeorm';
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
import { InternInformationDto } from 'src/interns-information/dto/intern-information.dto';
import { User } from 'src/users/entities/user.entity';

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
      const trainingPlans = await this.trainingPlanRepository
        .createQueryBuilder('plan')
        .leftJoinAndSelect('plan.skills', 'planSkill')
        .leftJoinAndSelect('planSkill.skill', 'skill')
        .leftJoinAndSelect(
          'plan.assignments',
          'assignment',
          'assignment.isAssigned = false',
        )
        .leftJoinAndSelect('assignment.task', 'task')
        .leftJoinAndSelect('assignment.skills', 'assignmentSkill')
        .leftJoinAndSelect('assignmentSkill.skill', 'assignmentSkillDetail')
        .where('plan.isDeleted = false')
        .getMany();

      return plainToInstance(TrainingPlanDto, trainingPlans, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching training plans: ${error.message}`,
      );
    }
  }

  async findAllByUser(userId: string): Promise<TrainingPlanDto[]> {
    try {
      const trainingPlans = await this.trainingPlanRepository
        .createQueryBuilder('plan')
        .leftJoinAndSelect('plan.skills', 'planSkill')
        .leftJoinAndSelect('planSkill.skill', 'skill')
        .leftJoinAndSelect(
          'plan.assignments',
          'assignment',
          'assignment.isAssigned = false',
        )
        .leftJoinAndSelect('assignment.task', 'task')
        .leftJoinAndSelect('assignment.skills', 'assignmentSkill')
        .leftJoinAndSelect('assignmentSkill.skill', 'assignmentSkillDetail')
        .where('plan.isDeleted = false AND plan.createdBy = :userId', {
          userId: userId,
        })
        .getMany();

      return plainToInstance(TrainingPlanDto, trainingPlans, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching training plans: ${error.message}`,
      );
    }
  }

  async findOne(id: string, user: SimpleUserDto): Promise<TrainingPlanDto> {
    try {
      const trainingPlan = await this.trainingPlanRepository
        .createQueryBuilder('plan')
        .leftJoinAndSelect('plan.skills', 'planSkill')
        .leftJoinAndSelect('planSkill.skill', 'skill')
        .leftJoinAndSelect(
          'plan.assignments',
          'assignment',
          'assignment.isAssigned = false',
        )
        .leftJoinAndSelect('assignment.task', 'task')
        .leftJoinAndSelect('assignment.skills', 'assignmentSkill')
        .leftJoinAndSelect('assignmentSkill.skill', 'assignmentSkillDetail')
        .where('plan.isDeleted = false AND plan.id = :id', { id })
        .getOne();

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
        `Error fetching training plan: ${error.message}`,
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
          where: { id: savedTrainingPlan.id, isDeleted: false },
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
        `Error creating training plan: ${error.message}`,
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
      const existingTrainingPlan = await this.trainingPlanRepository.findOne({
        where: {
          id,
          isDeleted: false,
        },
      });

      if (!existingTrainingPlan) {
        throw new NotFoundException(`Training plan ${id} not found`);
      }

      if (user.role !== 'admin' && existingTrainingPlan.createdBy !== user.id) {
        throw new ForbiddenException(
          'You do not have permission to update this training plan',
        );
      }

      const { assignments, skills, ...updatePlanData } = updateData;

      if (skills && skills.length > 0) {
        await this.validateSkillsExist(skills);
      }

      if (assignments && assignments.length > 0) {
        await this.validateAssignmentsData(assignments);
      }

      const updatedTrainingPlanId = await this.dataSource.transaction(
        async (manager) => {
          if (!existingTrainingPlan.id) {
            throw new BadRequestException('Training plan ID is missing');
          }

          Object.assign(existingTrainingPlan, updatePlanData);
          await manager.save(TrainingPlan, existingTrainingPlan);

          // Maybe bug here
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

          // Maybe bug here
          // Update Assignments if provided
          if (assignments && assignments.length > 0) {
            // Delete all existing assignments and their skills for this plan
            const existingAssignments = await manager.find(Assignment, {
              where: { planId: existingTrainingPlan.id },
            });

            if (existingAssignments.length > 0) {
              const assignmentIds = existingAssignments.map((a) => a.id);

              await Promise.all([
                manager.delete(AssignmentSkill, {
                  assignmentId: In(assignmentIds),
                }),
                manager.delete(Assignment, {
                  id: In(assignmentIds),
                }),
              ]);
            }

            // Create new assignments
            for (const assignmentData of assignments) {
              const { skillIds, planId, ...assignmentFields } = assignmentData;

              // Ensure planId is set correctly and not null
              if (!existingTrainingPlan.id) {
                throw new BadRequestException(
                  'Training plan ID is required for assignment',
                );
              }

              const newAssignment = manager.create(Assignment, {
                ...assignmentFields,
                planId: existingTrainingPlan.id,
                createdBy: user.id,
              });

              // Save assignment
              const savedAssignment = await manager.save(
                Assignment,
                newAssignment,
              );

              // Create AssignmentSkill
              if (skillIds?.length > 0) {
                const assignmentSkills = skillIds.map((skillId) =>
                  manager.create(AssignmentSkill, {
                    assignmentId: savedAssignment.id,
                    skillId,
                  }),
                );
                await manager.save(AssignmentSkill, assignmentSkills);
              }
            }
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

        // Assign planId and mentorId to the intern's information
        internsInfo.planId = id;
        internsInfo.mentorId = trainingPlan.createdBy;
        await manager.save(InternInformation, internsInfo);

        // Change isAssigned in User entity to true
        const updatedInternUserResult = await manager.update(User, internId, {
          isAssigned: true,
        });
        const updatedMentorUserResult = await manager.update(User, user.id, {
          isAssigned: true,
        });

        // change Assignment's assignedTo to the internId
        const assignmentsToUpdate = await manager.find(Assignment, {
          where: { planId: id },
        });

        // Duplicate assignments for the new intern
        for (const assignment of assignmentsToUpdate) {
          const newAssignment = manager.create(Assignment, {
            ...assignment,
            id: undefined,
            assignedTo: internId,
            dueDate: internsInfo.endDate,
            isAssigned: true,
          });
          const savedAssignment = await manager.save(Assignment, newAssignment);

          // Duplicate AssignmentSkills
          const assignmentSkills = await manager.find(AssignmentSkill, {
            where: { assignmentId: assignment.id },
          });

          if (assignmentSkills?.length > 0) {
            const duplicatedSkills = assignmentSkills.map((skill) =>
              manager.create(AssignmentSkill, {
                ...skill,
                id: undefined,
                assignmentId: savedAssignment.id,
              }),
            );

            await manager.save(AssignmentSkill, duplicatedSkills);
          }
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

  async findPlansWithInterns(user: SimpleUserDto): Promise<any[]> {
    try {
      const queryBuilder = this.internInformationRepository
        .createQueryBuilder('internInfo')
        .leftJoinAndSelect('internInfo.intern', 'intern')
        .leftJoinAndSelect('internInfo.mentor', 'mentor')
        .leftJoinAndSelect('internInfo.plan', 'plan')
        .leftJoinAndSelect('plan.skills', 'planSkills')
        .leftJoinAndSelect('planSkills.skill', 'skill')
        .leftJoinAndSelect(
          'plan.assignments',
          'assignments',
          'assignments.isDeleted = :assignmentDeleted AND assignments.isAssigned = :isAssigned AND assignments.assignedTo = intern.id',
          { assignmentDeleted: false, isAssigned: true },
        )
        .leftJoinAndSelect('assignments.task', 'task')
        .leftJoinAndSelect('assignments.skills', 'assignmentSkills')
        .leftJoinAndSelect('assignmentSkills.skill', 'assignmentSkill')
        .where('internInfo.isDeleted = :internInfoDeleted', {
          internInfoDeleted: false,
        })
        .andWhere('internInfo.planId IS NOT NULL')
        .andWhere('plan.createdBy = :userId', { userId: user.id });

      const internsInfo = await queryBuilder.getMany();
      return plainToInstance(InternInformationDto, internsInfo, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching training plans with interns: ${error.message}`,
      );
    }
  }
}
