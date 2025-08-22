import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TrainingPlanSkill } from './training-plan-skill.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { InternInformation } from 'src/interns-information/entities/intern-information.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class TrainingPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  extra: string;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(
    () => TrainingPlanSkill,
    (trainingPlanSkill) => trainingPlanSkill.plan,
    {
      cascade: true,
    },
  )
  skills: TrainingPlanSkill[];

  @OneToMany(() => Assignment, (assignment) => assignment.trainingPlan, {
    cascade: true,
  })
  assignments: Assignment[];

  @OneToMany(() => InternInformation, (info) => info.plan)
  interns: InternInformation[];
}
