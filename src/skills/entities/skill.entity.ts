import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ default: false })
  is_deleted: boolean;
}
