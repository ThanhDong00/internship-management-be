import { PartialType } from '@nestjs/mapped-types';
import { CreateInternInformationDto } from './create-intern-information.dto';

export class UpdateInternInformationDto extends PartialType(
  CreateInternInformationDto,
) {}
