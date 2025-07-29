import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { Repository } from 'typeorm';
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
      //...

      // Create assignment
      const assignment = this.assignmentRepository.create({
        ...assignmentData,
        createdBy: user.id,
      });
      const savedAssignment = await this.assignmentRepository.save(assignment);

      // Create assignment skills
      const assignmentSkills = skillIds.map((skillId) =>
        this.assignmentSkillRepository.create({
          assignmentId: savedAssignment.id,
          skillId: skillId,
        }),
      );
      await this.assignmentSkillRepository.save(assignmentSkills);

      const createdAssignment = await this.findOneById(savedAssignment.id);
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

  async findAll(user: SimpleUserDto): Promise<AssignmentDto[]> {
    try {
      const whereCondition: any = {
        isDeleted: false,
      };

      if (user.role === 'intern') {
        whereCondition.assignedTo = user.id;
      } else if (user.role === 'mentor') {
        whereCondition.createdBy = user.id;
      }

      const assignments = await this.assignmentRepository.find({
        where: whereCondition,
        relations: ['skills', 'skills.skill', 'task'],
      });

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

  async findOne(id: string, user: SimpleUserDto): Promise<AssignmentDto> {
    try {
      const whereCondition: any = {
        id: id,
        isDeleted: false,
      };

      if (user.role === 'intern') {
        whereCondition.assignedTo = user.id;
      } else if (user.role === 'mentor') {
        whereCondition.createdBy = user.id;
      }

      const assignment = await this.assignmentRepository.findOne({
        where: whereCondition,
        relations: ['skills', 'skills.skill', 'task'],
      });

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

  async updateStatus(id: string, user: SimpleUserDto): Promise<AssignmentDto> {
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

      assignment.status = 'InProgress';
      await this.assignmentRepository.save(assignment);

      return plainToInstance(AssignmentDto, assignment, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error updating assignment status to InProgress',
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
      const whereCondition: any = {
        id: id,
        isDeleted: false,
      };

      const assignment = await this.assignmentRepository.findOne({
        where: whereCondition,
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

      await this.assignmentRepository.update(id, assignmentData);

      // delete old skill, create new skill
      if (skillIds && skillIds.length > 0) {
        // check if skill exist
        // ...

        await this.assignmentSkillRepository.delete({
          assignmentId: id,
        });

        const newAssignmentSkills = skillIds.map((skillId) =>
          this.assignmentSkillRepository.create({
            assignmentId: id,
            skillId: skillId,
          }),
        );
        await this.assignmentSkillRepository.save(newAssignmentSkills);
      }

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
