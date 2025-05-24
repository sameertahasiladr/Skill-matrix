import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { Role } from '../../master/entities/role.entity';
  import { Designation } from '../../master/entities/designation.entity';
  
  @Entity()
  export class SkillMatrixToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    token: string;
  
    @ManyToOne(() => Role)
    role: Role;
  
    @ManyToOne(() => Designation)
    designation: Designation;
  
    @Column({ type: 'timestamp', nullable: true })
    expiresAt: Date;
  
    @CreateDateColumn()
    createdAt: Date;
  }
  