import { CreateInternInformationDto } from '../../interns-information/dto/create-intern-information.dto';

export class CreateUserDto {
  email: string;
  username: string;
  password: string;
  full_name: string;
  phone_number?: string;
  dob?: Date;
  address?: string;
  role: 'admin' | 'mentor' | 'intern';
  status?: 'active' | 'inactive';
  is_assigned?: boolean;
  is_deleted?: boolean;
  intern_information?: CreateInternInformationDto;
}
