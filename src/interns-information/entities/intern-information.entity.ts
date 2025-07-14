import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('interns_information')
export class InternInformation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  field: string;

  @Column({ unique: true })
  intern_id: string;

  @Column({ nullable: true })
  mentor_id: string;

  @Column({ nullable: true })
  plan_id: string;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @Column('enum', {
    enum: ['Onboarding', 'InProgress', 'Completed'],
    default: 'Onboarding',
  })
  status: string;

  @Column({ default: false })
  is_deleted: boolean;
}
