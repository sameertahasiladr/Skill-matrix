import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Levels } from './levels.entity';
import { OneToMany } from 'typeorm';
import { TagSkills } from './tagskills.entity';
import { Role } from '../../master/entities/role.entity';
import { MainSkill } from '../../master/entities/mainskill.entity';
import { Designation } from '../../master/entities/designation.entity';

@Entity()
export class SkillMatrix {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  skills: string;

  @Column({ nullable: true, type: 'varchar', length: 1000 })
  description: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  example: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  responsibilities: string;

  @OneToMany(() => TagSkills, (tagSkill) => tagSkill.skills)
  tagSkills: TagSkills[];

  @ManyToOne(() => Levels, (level) => level.skills, {
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'levels_id' })
  levels: Levels;

  @ManyToOne(() => Role, (role) => role.skills, {
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => MainSkill, (mainSkill) => mainSkill.skills, {
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'mainSkill_id' })
  mainSkill: MainSkill;

  @ManyToOne(() => Designation, (designation) => designation.skills, {
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'designation_id' })
  designation: Designation;

  @Column()
  orderNo: number;

  @Column({ default: true })
  isVisible: boolean;
}
