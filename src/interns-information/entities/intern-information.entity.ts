import { TrainingPlan } from 'src/training-plans/entities/training-plan.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('interns_information')
export class InternInformation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  field: string;

  @Column({ unique: true })
  internId: string;

  // Relationship với User entity
  @OneToOne(() => User, (user) => user.internInformation)
  @JoinColumn({ name: 'internId' })
  intern: User;

  @Column({ nullable: true })
  mentorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'mentorId' })
  mentor: User;

  @Column({ nullable: true })
  planId: string;

  @ManyToOne(() => TrainingPlan, (plan) => plan.interns)
  @JoinColumn({ name: 'planId' })
  plan: TrainingPlan;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column('enum', {
    enum: ['Onboarding', 'InProgress', 'Completed', 'Dropped'],
    default: 'Onboarding',
  })
  status: string;

  @Column({ default: false })
  isDeleted: boolean;
}
