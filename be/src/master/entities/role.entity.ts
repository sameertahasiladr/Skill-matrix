import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Legend } from './legend.entity';
import { SkillMatrix } from '../../skills/entities/skillMatrix.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @OneToMany(() => Legend, (legend) => legend.role)
  legend: Legend[];

  @OneToMany(() => SkillMatrix, (skill) => skill.role)
    skills: SkillMatrix[];
}
