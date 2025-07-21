import { IsEmail, IsNotEmpty } from 'class-validator';
import { CreateInternInformationDto } from '../../interns-information/dto/create-intern-information.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: 'Username is required' })
  @ApiProperty()
  username: string;

  @IsNotEmpty({ message: 'Password is required' })
  @ApiProperty()
  password: string;

  @IsNotEmpty({ message: 'Full name is required' })
  @ApiProperty()
  fullName: string;

  @ApiProperty({ required: false })
  phoneNumber?: string;

  @ApiProperty({ required: false })
  dob?: Date;

  @ApiProperty({ required: false })
  address?: string;

  @IsNotEmpty({ message: 'Role is required' })
  @ApiProperty({ enum: ['admin', 'mentor', 'intern'] })
  role: 'admin' | 'mentor' | 'intern';

  @ApiProperty({ enum: ['active', 'inactive'], required: false })
  status?: 'active' | 'inactive';

  @ApiProperty({ required: false })
  isAssigned?: boolean;

  isDeleted?: boolean;

  internInformation?: CreateInternInformationDto;
}
