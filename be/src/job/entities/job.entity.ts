import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UploadSummary } from '../uploadSummary.interface';

@Entity()
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  jobType: string;

  @Column()
  status: string;

  @Column()
  filePath: string;

  @Column({ type: 'timestamp' })
  uploadDate: Date;

  @Column({ type: 'json', nullable: true })
  uploadSummary: UploadSummary;
  
  @Column({ nullable: true })
  download: string;
}
