import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TrainingPlan } from './training-plan.entity';
import { Skill } from 'src/skills/entities/skill.entity';

@Entity()
export class TrainingPlanSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  planId: string;

  @Column({ nullable: false })
  skillId: string;

  @Column({ default: false })
  isDeleted: boolean;

  @ManyToOne(() => TrainingPlan, (trainingPlan) => trainingPlan.skills)
  @JoinColumn({ name: 'planId' })
  plan: TrainingPlan;

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'skillId' })
  skill: Skill;
}
