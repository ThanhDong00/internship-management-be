import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InternInformation } from './entities/intern-information.entity';
import { Repository } from 'typeorm';
import { CreateInternInformationDto } from './dto/create-intern-information.dto';
import { InternInformationDto } from './dto/intern-information.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateInternInformationDto } from './dto/update-intern-information.dto';

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
    const internInfos = await this.internInfoRepo.find({
      where: { isDeleted: false },
    });
    return internInfos.map((info) =>
      plainToInstance(InternInformationDto, info, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findOne(id: string): Promise<InternInformationDto | null> {
    const internInfo = await this.internInfoRepo.findOne({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    return internInfo;
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
  }

  async updatePlan(
    id: string,
    planId: string,
    user: any,
  ): Promise<InternInformationDto | null> {
    const internInfo = await this.internInfoRepo.findOne({
      where: { id: id, isDeleted: false },
    });

    if (!internInfo) {
      throw new NotFoundException('Intern information not found');
    }

    if (user.role === 'admin' || internInfo?.mentorId === user.id) {
      internInfo.planId = planId;
      await this.internInfoRepo.save(internInfo);

      return plainToInstance(InternInformationDto, internInfo, {
        excludeExtraneousValues: true,
      });
    }

    return null;
  }

  async updateMentor(
    id: string,
    mentorId: string,
  ): Promise<InternInformationDto> {
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
  }

  async update(
    id: string,
    updateData: UpdateInternInformationDto,
  ): Promise<InternInformationDto> {
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
  }
}
