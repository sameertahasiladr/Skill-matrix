// user-skill-rating.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { MainSkill } from 'src/master/entities/mainskill.entity';
  import { Levels } from 'src/skills/entities/levels.entity';
  
  @Entity()
  export class UserSkillRating {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    cci_id: string;
  
    @ManyToOne(() => MainSkill, { eager: true })
    mainSkill: MainSkill;
  
    @ManyToOne(() => Levels, { eager: true })
    level: Levels;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  