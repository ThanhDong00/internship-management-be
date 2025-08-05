import { Task } from 'src/tasks/entities/task.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AssignmentSkill } from './assignment-skill.entity';
import { TrainingPlan } from 'src/training-plans/entities/training-plan.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  planId: string;

  @ManyToOne(() => TrainingPlan)
  @JoinColumn({ name: 'planId' })
  trainingPlan: TrainingPlan;

  @Column({ nullable: false })
  taskId: string;

  @ManyToOne(() => Task)
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @OneToMany(
    () => AssignmentSkill,
    (assignmentSkill) => assignmentSkill.assignment,
    {
      cascade: true,
    },
  )
  skills: AssignmentSkill[];

  @Column({ nullable: false })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column({ nullable: true, type: 'uuid' })
  assignedTo: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedTo' })
  assignee: User;

  @Column()
  estimatedTime: number;

  @Column({ nullable: true, default: null })
  dueDate: Date;

  @Column({ nullable: true, default: null })
  submittedLink: string;

  @Column({ nullable: true, default: null })
  submittedAt: Date;

  @Column({ nullable: true, default: null })
  feedback: string;

  @Column({
    type: 'enum',
    enum: ['Todo', 'InProgress', 'Submitted', 'Reviewed'],
    default: 'Todo',
    nullable: false,
  })
  status: 'Todo' | 'InProgress' | 'Submitted' | 'Reviewed';

  @Column({ default: false })
  isAssigned: boolean;

  @Column({ default: false })
  isDeleted: boolean;
}
