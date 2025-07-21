import { PartialType } from '@nestjs/swagger';
import { CreateInternInformationDto } from './create-intern-information.dto';

export class UpdateInternInformationDto extends PartialType(
  CreateInternInformationDto,
) {}
