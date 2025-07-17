import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('interns_information')
export class InternInformation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  field: string;

  @Column({ unique: true })
  internId: string;

  @Column({ nullable: true })
  mentorId: string;

  @Column({ nullable: true })
  planId: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column('enum', {
    enum: ['Onboarding', 'InProgress', 'Completed'],
    default: 'Onboarding',
  })
  status: string;

  @Column({ default: false })
  isDeleted: boolean;
}
