import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Designation } from 'src/master/entities/designation.entity';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date_of_joining: Date;

  @Column()
  reporting_to: string;

  @Column()
  current_grade: string;

  @Column()
  current_location: string;

  @Column()
  present_city: string;

  @Column()
  present_state: string;

  // ? map
  @Column()
  current_dept: string;

  @Column()
  curr_designation_for_reporting: string;

  @Column({ type: 'date', nullable: true })
  date_of_leaving: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  current_client_one: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  current_client_two: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  current_client_three: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  current_client_four: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })

  current_experience: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  prev_emp_experience: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  years_served_in_curr_designation: number | null;

  @Column({ type: 'date' })
  curr_designation_since: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  current_business_sys_qualifications: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  current_core_tech_stack: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  current_secondary_tech_stack: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  personal_interests: string | null;

  @Column()
  employment_status: string;

  @Column()
  user_group: string;

  @OneToOne(() => User, (user) => user.employee)
  user: User;

  @ManyToOne(() => Designation)
  @JoinColumn({ name: 'current_designation_id' })
  current_designation: Designation;
}
