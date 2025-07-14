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
  password_hash: string;

  @Column()
  full_name: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  dob: Date;

  @Column({ nullable: true })
  address: string;

  @Column('enum', { enum: ['admin', 'mentor', 'intern'] })
  role: string;

  @Column('enum', { enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Column({ default: false })
  is_assigned: boolean;

  @Column({ default: false })
  is_deleted: boolean;
}
