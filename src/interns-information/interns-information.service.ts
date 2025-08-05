import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InternInformation } from './entities/intern-information.entity';
import { Repository } from 'typeorm';
import { CreateInternInformationDto } from './dto/create-intern-information.dto';
import { InternInformationDto } from './dto/intern-information.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateInternInformationDto } from './dto/update-intern-information.dto';
import { SimpleUserDto } from 'src/users/dto/simple-user.dto';

@Injectable()
export class InternsInformationService {
  constructor(
    @InjectRepository(InternInformation)
    private readonly internInfoRepo: Repository<InternInformation>,
  ) {}

  async create(
    createInternInfoDto: CreateInternInformationDto,
  ): Promise<InternInformation> {
    const internInfo = this.internInfoRepo.create(createInternInfoDto);
    return await this.internInfoRepo.save(internInfo);
  }

  async findAll(): Promise<InternInformationDto[]> {
    try {
      const internInfos = await this.internInfoRepo.find({
        where: { isDeleted: false },
        relations: ['intern', 'mentor', 'plan'],
      });
      return plainToInstance(InternInformationDto, internInfos, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching intern information',
      );
    }
  }

  async findOne(id: string): Promise<InternInformationDto | null> {
    try {
      const internInfo = await this.internInfoRepo.findOne({
        where: {
          id: id,
          isDeleted: false,
        },
      });

      if (!internInfo) {
        throw new NotFoundException('Intern information not found');
      }

      return plainToInstance(InternInformationDto, internInfo, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error fetching intern information: ' + error.message,
      );
    }
  }

  async findOneForIntern(user: SimpleUserDto): Promise<InternInformationDto> {
    try {
      const plan = await this.internInfoRepo
        .createQueryBuilder('internInfo')
        .leftJoinAndSelect('internInfo.plan', 'plan')
        .leftJoinAndSelect('plan.skills', 'planSkill')
        .leftJoinAndSelect('planSkill.skill', 'skill')
        .leftJoinAndSelect(
          'plan.assignments',
          'assignment',
          'assignment.isAssigned = true AND assignment.assignedTo = :internId',
          {
            internId: user.id,
          },
        )
        .leftJoinAndSelect('assignment.task', 'task')
        .leftJoinAndSelect('assignment.creator', 'assignmentCreator')
        .leftJoinAndSelect('assignment.skills', 'assignmentSkill')
        .leftJoinAndSelect('assignmentSkill.skill', 'assignmentSkillDetail')
        .leftJoinAndSelect('internInfo.mentor', 'mentor')
        .where('internInfo.internId = :internId', { internId: user.id })
        .getOne();

      if (!plan) {
        throw new NotFoundException(`Training plan not found for intern`);
      }

      return plainToInstance(InternInformationDto, plan, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error fetching training plan for intern: ${error.message}`,
      );
    }
  }

  async findByInternId(internId: string): Promise<InternInformation | null> {
    return this.internInfoRepo.findOne({
      where: {
        internId: internId,
        isDeleted: false,
      },
    });
  }

  async updateStatus(
    id: string,
    status: string,
  ): Promise<InternInformationDto> {
    try {
      const internInfo = await this.internInfoRepo.findOne({
        where: { id: id, isDeleted: false },
      });

      if (!internInfo) {
        throw new NotFoundException('Intern information not found');
      }

      internInfo.status = status;
      await this.internInfoRepo.save(internInfo);

      return plainToInstance(InternInformationDto, internInfo, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error updating intern status: ' + error.message,
      );
    }
  }

  async updatePlan(
    id: string,
    planId: string,
    user: any,
  ): Promise<InternInformationDto | null> {
    try {
      const internInfo = await this.internInfoRepo.findOne({
        where: { id: id, isDeleted: false },
      });

      if (!internInfo) {
        throw new NotFoundException('Intern information not found');
      }

      if (user.role === 'mentor' && internInfo?.mentorId !== user.id) {
        throw new ForbiddenException(
          'You do not have permission to update this intern information',
        );
      }

      internInfo.planId = planId;
      await this.internInfoRepo.save(internInfo);

      return plainToInstance(InternInformationDto, internInfo, {
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
        'Error updating intern plan: ' + error.message,
      );
    }
  }

  async updateMentor(
    id: string,
    mentorId: string,
  ): Promise<InternInformationDto> {
    try {
      const internInfo = await this.internInfoRepo.findOne({
        where: { id: id, isDeleted: false },
      });

      if (!internInfo) {
        throw new NotFoundException('Intern information not found');
      }

      internInfo.mentorId = mentorId;
      await this.internInfoRepo.save(internInfo);

      return plainToInstance(InternInformationDto, internInfo, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error updating intern mentor: ' + error.message,
      );
    }
  }

  async update(
    id: string,
    updateData: UpdateInternInformationDto,
  ): Promise<InternInformationDto> {
    try {
      const internInfo = await this.internInfoRepo.findOne({
        where: { id: id, isDeleted: false },
      });

      if (!internInfo) {
        throw new NotFoundException('Intern information not found');
      }

      Object.assign(internInfo, updateData);
      await this.internInfoRepo.save(internInfo);

      return plainToInstance(InternInformationDto, internInfo, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error updating intern information: ' + error.message,
      );
    }
  }
}
