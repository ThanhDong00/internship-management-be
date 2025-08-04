import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { AssignmentDto } from './dto/assignment.dto';
import { SimpleUserDto } from 'src/users/dto/simple-user.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentSkill } from './entities/assignment-skill.entity';
import { Skill } from 'src/skills/entities/skill.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,

    @InjectRepository(AssignmentSkill)
    private readonly assignmentSkillRepository: Repository<AssignmentSkill>,

    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,

    private readonly dataSource: DataSource,
  ) {}

  async create(
    createAssignmentDto: CreateAssignmentDto,
    user: SimpleUserDto,
  ): Promise<AssignmentDto> {
    try {
      const { skillIds, ...assignmentData } = createAssignmentDto;

      if (!skillIds || skillIds.length === 0) {
        throw new BadRequestException('At least one skill is required');
      }

      // Check if all skills exist
      await this.validateSkillsExist(skillIds);

      const createdAssignmentId = await this.dataSource.transaction(
        async (manager) => {
          // Create assignment
          const assignment = manager.create(Assignment, {
            ...assignmentData,
            createdBy: user.id,
          });
          const savedAssignment = await manager.save(Assignment, assignment);

          // Create assignment skills
          const assignmentSkills = skillIds.map((skillId) =>
            manager.create(AssignmentSkill, {
              assignmentId: savedAssignment.id,
              skillId: skillId,
            }),
          );
          await manager.save(AssignmentSkill, assignmentSkills);

          return savedAssignment.id;
        },
      );

      const createdAssignment = await this.findOneById(createdAssignmentId);
      return plainToInstance(AssignmentDto, createdAssignment, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error creating assignment',
        error.message,
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

  private async findOneById(id: string): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['skills', 'skills.skill', 'task'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return assignment;
  }

  async findAll(
    status?: 'Todo' | 'InProgress' | 'Submitted' | 'Reviewed',
    isAssigned?: boolean,
  ): Promise<AssignmentDto[]> {
    try {
      const whereCondition: any = {
        isDeleted: false,
      };

      if (status) {
        whereCondition.status = status;
      }

      if (isAssigned !== undefined) {
        whereCondition.isAssigned = isAssigned;
      }

      const assignments = await this.assignmentRepository
        .createQueryBuilder('assignment')
        .leftJoinAndSelect('assignment.skills', 'skills')
        .leftJoinAndSelect('skills.skill', 'skill')
        .leftJoinAndSelect('assignment.task', 'task')
        .leftJoinAndSelect('assignment.assignee', 'assignee')
        .where(whereCondition)
        .getMany();

      return plainToInstance(AssignmentDto, assignments, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching assignments',
        error.message,
      );
    }
  }

  async findAllByUser(
    user: SimpleUserDto,
    status?: 'Todo' | 'InProgress' | 'Submitted' | 'Reviewed',
    isAssigned?: boolean,
  ): Promise<AssignmentDto[]> {
    try {
      const whereCondition: any = {
        isDeleted: false,
      };

      if (user.role === 'intern') {
        whereCondition.assignedTo = user.id;
      } else if (user.role === 'mentor') {
        whereCondition.createdBy = user.id;
      }

      if (status) {
        whereCondition.status = status;
      }

      if (isAssigned !== undefined) {
        whereCondition.isAssigned = isAssigned;
      }

      const assignments = await this.assignmentRepository
        .createQueryBuilder('assignment')
        .leftJoinAndSelect('assignment.skills', 'skills')
        .leftJoinAndSelect('skills.skill', 'skill')
        .leftJoinAndSelect('assignment.task', 'task')
        .leftJoinAndSelect('assignment.assignee', 'assignee')
        .where(whereCondition)
        .getMany();

      return plainToInstance(AssignmentDto, assignments, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching assignments',
        error.message,
      );
    }
  }

  async findOne(
    id: string,
    user: SimpleUserDto,
    isAssigned?: boolean,
  ): Promise<AssignmentDto> {
    try {
      const whereCondition: any = {
        id: id,
        isDeleted: false,
        isAssigned: true,
      };

      if (user.role === 'intern') {
        whereCondition.assignedTo = user.id;
      } else if (user.role === 'mentor') {
        whereCondition.createdBy = user.id;
      }

      if (isAssigned !== undefined) {
        whereCondition.isAssigned = isAssigned;
      }

      const assignment = await this.assignmentRepository
        .createQueryBuilder('assignment')
        .leftJoinAndSelect('assignment.skills', 'skills')
        .leftJoinAndSelect('skills.skill', 'skill')
        .leftJoinAndSelect('assignment.task', 'task')
        .leftJoinAndSelect('assignment.assignee', 'assignee')
        .where(whereCondition)
        .getOne();

      if (!assignment) {
        throw new NotFoundException('Assignment not found');
      }

      return plainToInstance(AssignmentDto, assignment, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching assignment',
        error.message,
      );
    }
  }

  async updateStatus(
    id: string,
    user: SimpleUserDto,
    status: 'Todo' | 'InProgress' | 'Submitted' | 'Reviewed',
  ): Promise<AssignmentDto> {
    try {
      const whereCondition: any = {
        id: id,
        isDeleted: false,
      };

      if (user.role === 'intern') {
        whereCondition.assignedTo = user.id;
      }

      const assignment = await this.assignmentRepository.findOne({
        where: whereCondition,
      });

      if (!assignment) {
        throw new NotFoundException('Assignment not found');
      }

      if (!status) {
        throw new BadRequestException('Status is required');
      }

      if (status === 'Reviewed') {
        throw new ForbiddenException(
          'You cannot change the status to Reviewed',
        );
      }

      assignment.status = status;
      await this.assignmentRepository.save(assignment);

      return plainToInstance(AssignmentDto, assignment, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error updating assignment status to ${status}`,
        error.message,
      );
    }
  }

  async submit(
    id: string,
    user: SimpleUserDto,
    data: string,
  ): Promise<AssignmentDto> {
    try {
      const whereCondition: any = {
        id: id,
        isDeleted: false,
      };

      if (user.role === 'intern') {
        whereCondition.assignedTo = user.id;
      }

      const assignment = await this.assignmentRepository.findOne({
        where: whereCondition,
      });

      if (!assignment) {
        throw new NotFoundException('Assignment not found');
      }

      assignment.submittedAt = new Date();
      assignment.submittedLink = data;
      assignment.status = 'Submitted';

      await this.assignmentRepository.save(assignment);

      return plainToInstance(AssignmentDto, assignment, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error submitting assignment',
        error.message,
      );
    }
  }

  async review(
    id: string,
    user: SimpleUserDto,
    data: string,
  ): Promise<AssignmentDto> {
    try {
      const whereCondition: any = {
        id: id,
        isDeleted: false,
      };

      if (user.role === 'mentor') {
        whereCondition.createdBy = user.id;
      }

      const assignment = await this.assignmentRepository.findOne({
        where: whereCondition,
      });

      if (!assignment) {
        throw new NotFoundException('Assignment not found');
      }

      assignment.feedback = data;
      assignment.status = 'Reviewed';

      await this.assignmentRepository.save(assignment);

      return plainToInstance(AssignmentDto, assignment, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error reviewing assignment',
        error.message,
      );
    }
  }

  async update(
    id: string,
    user: SimpleUserDto,
    updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<AssignmentDto> {
    try {
      const assignment = await this.assignmentRepository.findOne({
        where: { id: id, isDeleted: false },
        relations: ['skills'],
      });

      if (!assignment) {
        throw new NotFoundException('Assignment not found');
      }

      if (user.role !== 'admin' && assignment.createdBy !== user.id) {
        throw new ForbiddenException(
          'You can only update your own assignments',
        );
      }

      const { skillIds, ...assignmentData } = updateAssignmentDto;

      if (skillIds && skillIds.length > 0) {
        await this.validateSkillsExist(skillIds);
      }

      await this.dataSource.transaction(async (manager) => {
        await manager.update(Assignment, id, assignmentData);

        // delete old skill, create new skill
        if (skillIds && skillIds.length > 0) {
          await manager.delete(AssignmentSkill, {
            assignmentId: id,
          });

          const newAssignmentSkills = skillIds.map((skillId) =>
            manager.create(AssignmentSkill, {
              assignmentId: id,
              skillId: skillId,
            }),
          );
          await manager.save(AssignmentSkill, newAssignmentSkills);
        }
      });

      const updatedAssignment = await this.findOneById(id);

      return plainToInstance(AssignmentDto, updatedAssignment, {
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
        'Error updating assignment',
        error.message,
      );
    }
  }

  async delete(id: string, user: SimpleUserDto) {
    return 'Assignment deletion is not implemented';
  }
}
