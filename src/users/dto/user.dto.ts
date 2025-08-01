import { Exclude, Expose } from 'class-transformer';
import { InternInformationDto } from 'src/interns-information/dto/intern-information.dto';

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Exclude()
  passwordHash: string;

  @Expose()
  fullName: string;

  @Expose()
  phoneNumber?: string;

  @Expose()
  dob?: Date;

  @Expose()
  address?: string;

  @Expose()
  role: 'admin' | 'mentor' | 'intern';

  @Expose()
  status?: 'active' | 'inactive';

  @Expose()
  isAssigned?: boolean;

  @Exclude()
  isDeleted?: boolean;

  internInformation?: InternInformationDto;
}
