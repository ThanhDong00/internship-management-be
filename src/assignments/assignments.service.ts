import {
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

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
  ) {}

  async create(
    createAssignmentDto: CreateAssignmentDto,
    user: SimpleUserDto,
  ): Promise<AssignmentDto> {
    if (user.role === 'intern') {
      throw new ForbiddenException(
        'You do not have permission to create assignments',
      );
    }

    try {
      const assignment = this.assignmentRepository.create({
        ...createAssignmentDto,
        createdBy: user.id,
      });

      const savedAssignment = await this.assignmentRepository.save(assignment);

      return plainToInstance(AssignmentDto, savedAssignment, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error creating assignment',
        error.message,
      );
    }
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

      if (user.role === 'mentor') {
        whereCondition.createdBy = user.id;
      }

      const assignment = await this.assignmentRepository.findOne({
        where: whereCondition,
      });

      if (!assignment) {
        throw new NotFoundException('Assignment not found');
      }

      Object.assign(assignment, updateAssignmentDto);
      await this.assignmentRepository.save(assignment);

      return plainToInstance(AssignmentDto, assignment, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
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
