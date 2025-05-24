import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Designation } from './designation.entity';
import { Role } from './role.entity';
import { MainSkill } from './mainskill.entity';

@Entity()
export class Legend {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Designation, { eager: true })
  designation: Designation;

  @ManyToOne(() => Role, { eager: true })
  role: Role | null;

  @ManyToOne(() => MainSkill, { eager: true })
  mainSkill: MainSkill | null;

  @Column('text')
  description: string;
}
