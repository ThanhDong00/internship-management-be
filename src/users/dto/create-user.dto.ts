import { IsEmail, IsNotEmpty } from 'class-validator';
import { CreateInternInformationDto } from '../../interns-information/dto/create-intern-information.dto';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  phoneNumber?: string;

  dob?: Date;

  address?: string;

  @IsNotEmpty({ message: 'Role is required' })
  role: 'admin' | 'mentor' | 'intern';

  status?: 'active' | 'inactive';

  isAssigned?: boolean;

  isDeleted?: boolean;

  internInformation?: CreateInternInformationDto;
}
