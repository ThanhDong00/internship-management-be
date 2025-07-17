import { Exclude } from 'class-transformer';
import { InternInformationDto } from 'src/interns-information/dto/intern-information.dto';

export class UserDto {
  id: string;

  email: string;

  username: string;

  @Exclude()
  passwordHash: string;

  fullName: string;

  phoneNumber?: string;

  dob?: Date;

  address?: string;

  role: 'admin' | 'mentor' | 'intern';

  status?: 'active' | 'inactive';

  isAssigned?: boolean;

  @Exclude()
  isDeleted?: boolean;

  internInformation?: InternInformationDto;
}
