import { Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { SkillMatrix } from './skillMatrix.entity';
import { Tags } from './tags.entity';

@Entity()
export class TagSkills {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SkillMatrix, (skill) => skill.tagSkills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'skills_id' })
  skills: SkillMatrix;

  @ManyToOne(() => Tags, (tag) => tag.tagSkills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tags_id' })
  tags: Tags;
}
