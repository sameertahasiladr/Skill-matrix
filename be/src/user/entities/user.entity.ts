import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { AuditingEntity } from 'src/core/entities/auditing.entity';
import { Employee } from 'src/employee/entities/employee.entity';

@Entity()
export class User extends AuditingEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  emp_email: string;

  @Column({ default: 'user' })
  role: string;

  @Column()
  password: string;

  @Column()
  cci_id: string;

  @Column({ default: 'Inactive' })
  signup_status: string;

  @OneToOne(() => Employee, (employee) => employee.user)
  @JoinColumn({ name: 'emp_id' })
  employee: Employee;
}
