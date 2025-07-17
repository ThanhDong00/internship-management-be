import { Expose } from 'class-transformer';

export class SimpleUserDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  fullName: string;

  @Expose()
  role: 'admin' | 'mentor' | 'intern';

  @Expose()
  status?: 'active' | 'inactive';
}
