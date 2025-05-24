import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Tokens {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' }) 
  token: string; 

  @Column({ type: 'varchar' })
  cci_id: string; 

  @Column({ type: 'timestamp' })
  expires_at: Date; 
}
