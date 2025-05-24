import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Legend } from './legend.entity';
import { SkillMatrix } from '../../skills/entities/skillMatrix.entity';

@Entity()
export class Designation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  designation: string;

  @OneToMany(() => Legend, (master) => master.designation)
  masters: Legend[];

  @OneToMany(() => SkillMatrix, (skill) => skill.designation)
  skills: SkillMatrix[];
}
