import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SkillMatrix } from './skillMatrix.entity';

@Entity()
export class Levels {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  level: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => SkillMatrix, (skill) => skill.levels)
  skills: SkillMatrix[];
}
