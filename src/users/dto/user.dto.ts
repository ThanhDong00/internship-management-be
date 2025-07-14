import { Exclude } from 'class-transformer';
import { InternInformationDto } from 'src/interns-information/dto/intern-information.dto';

export class UserDto {
  id: string;

  email: string;

  username: string;

  @Exclude()
  password_hash: string;

  full_name: string;

  phone_number?: string;

  dob?: Date;

  address?: string;

  role: 'admin' | 'mentor' | 'intern';

  status?: 'active' | 'inactive';

  is_assigned?: boolean;

  is_deleted?: boolean;

  intern_information?: InternInformationDto;
}
