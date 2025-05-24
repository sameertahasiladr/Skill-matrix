import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TagSkills } from './tagskills.entity';

@Entity()
export class Tags {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tags: string;

  @OneToMany(() => TagSkills, (tagSkill) => tagSkill.tags)
  tagSkills: TagSkills[];
}
