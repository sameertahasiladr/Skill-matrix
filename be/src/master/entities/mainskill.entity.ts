import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Legend } from './legend.entity';
import { SkillMatrix } from '../../skills/entities/skillMatrix.entity';
import { UserSkillRating } from '../../user-skill-rating/entities/user-skill-rating.entity';

@Entity()
export class MainSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  mainSkill: string;

  @OneToMany(() => Legend, (master) => master.mainSkill)
  masters: Legend[];

  @OneToMany(() => SkillMatrix, (skill) => skill.mainSkill)
  skills: SkillMatrix[];

  @OneToMany(
    () => UserSkillRating,
    (userSkillRating) => userSkillRating.mainSkill,
  )
  userSkillRatings: UserSkillRating[];
}
