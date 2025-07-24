import { InternInformation } from 'src/interns-information/entities/intern-information.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

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

  // Relationship với intern information (chỉ có khi user.role === 'intern')
  @OneToOne(() => InternInformation, (internInfo) => internInfo.intern, {
    nullable: true,
    cascade: true, // Tự động lưu/xóa intern information khi lưu/xóa user
  })
  internInformation?: InternInformation | null;
}
