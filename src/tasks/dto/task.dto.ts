import { Exclude, Expose, Type } from 'class-transformer';
import { SimpleUserDto } from 'src/users/dto/simple-user.dto';

export class TaskDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  extra?: string;

  @Exclude()
  createdBy: string;

  @Exclude()
  isDeleted: boolean;

  @Expose()
  @Type(() => SimpleUserDto)
  creator: SimpleUserDto;
}
