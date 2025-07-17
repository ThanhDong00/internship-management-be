import { InternInformation } from 'src/interns-information/entities/intern-information.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  dob: Date;

  @Column({ nullable: true })
  address: string;

  @Column('enum', { enum: ['admin', 'mentor', 'intern'] })
  role: string;

  @Column('enum', { enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Column({ default: false })
  isAssigned: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  internInformation?: InternInformation | null;
}
