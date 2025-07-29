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

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  planId: string;

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

  @Column({ nullable: true })
  assignedTo: string;

  @Column()
  estimatedTime: number;

  @Column()
  dueDate: Date;

  @Column()
  submittedLink: string;

  @Column()
  submittedAt: Date;

  @Column()
  feedback: string;

  @Column({
    type: 'enum',
    enum: ['Todo', 'InProgress', 'Submitted', 'Reviewed'],
    default: 'Todo',
    nullable: false,
  })
  status: 'Todo' | 'InProgress' | 'Submitted' | 'Reviewed';

  @Column({ default: false })
  isDeleted: boolean;
}
