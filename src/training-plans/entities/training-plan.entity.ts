import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TrainingPlanSkill } from './training-plan-skill.entity';

@Entity()
export class TrainingPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  createdBy: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  extra: string;

  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(() => TrainingPlanSkill, (skill) => skill.plan)
  skills: TrainingPlanSkill[];
}
