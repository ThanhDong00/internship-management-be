import { Exclude, Expose } from 'class-transformer';

export class TaskDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  extra?: string;

  @Expose()
  createdBy: string;

  @Exclude()
  isDeleted: boolean;
}
