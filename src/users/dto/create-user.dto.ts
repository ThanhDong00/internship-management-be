import { CreateInternInformationDto } from '../../interns-information/dto/create-intern-information.dto';

export class CreateUserDto {
  email: string;
  username: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  dob?: Date;
  address?: string;
  role: 'admin' | 'mentor' | 'intern';
  status?: 'active' | 'inactive';
  isAssigned?: boolean;
  isDeleted?: boolean;
  internInformation?: CreateInternInformationDto;
}
