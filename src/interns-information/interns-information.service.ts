import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InternInformation } from './entities/intern-information.entity';
import { Repository } from 'typeorm';
import { CreateInternInformationDto } from './dto/create-intern-information.dto';
import { InternInformationDto } from './dto/intern-information.dto';

@Injectable()
export class InternsInformationService {
  constructor(
    @InjectRepository(InternInformation)
    private readonly internInfoRepo: Repository<InternInformation>,
  ) {}

  async create(
    createInternInfoDto: CreateInternInformationDto,
  ): Promise<InternInformation> {
    try {
      const internInfo = this.internInfoRepo.create(createInternInfoDto);
      return await this.internInfoRepo.save(internInfo);
    } catch (error) {
      throw new HttpException(
        'Error creating intern information: ' + error.message,
        500,
      );
    }
  }

  async findByInternId(internId: string): Promise<InternInformation | null> {
    return this.internInfoRepo.findOne({
      where: {
        intern_id: internId,
        is_deleted: false,
      },
    });
  }
}
