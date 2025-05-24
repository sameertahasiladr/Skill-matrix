import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { Repository } from 'typeorm';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ExcelService } from '../excel/excel.service';
import { JobService } from './job.service';

@Injectable()
export class JobSchedulerService {
  constructor(
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
    @Inject() private readonly excelService: ExcelService,
    @Inject() private readonly jobService: JobService,
  ) {}
  @Cron(CronExpression.EVERY_30_SECONDS)
  async uploadFileScheduler() {
    Logger.log(`Running file upload schedule...`);

    // fetch oldest job with status: Queued
    const job = await this.jobRepository.findOne({
      where: {
        status: 'Queued',
      },
      order: {
        uploadDate: 'ASC',
      },
    });

    if (job) {
      // update the job status to pending
      job.status = 'Pending';
      await this.jobRepository.save(job);

      try {
        if (job.jobType == 'Employee File Upload') {
          // to process Employee sheets
          const uploadSummary = await this.excelService.processEmployeeFile(
            job.filePath,
          );
          if (uploadSummary) job.uploadSummary = uploadSummary; // update the summary
        } else if (job.jobType == 'Skill File Upload') {
          // to process Skill matrix sheets
          const uploadSummary = await this.excelService.processSkillMatrixFile(
            job.filePath,
          );
          if (uploadSummary) job.uploadSummary = uploadSummary; // update the summary
        }
        job.status = 'Completed'; // update the status to complete
      } catch (error) {
        job.status = 'Failed';
        Logger.warn(`Job ${job.id} failed`, error.stack);
      }
      await this.jobRepository.save(job);

      // delete the file after processing
      this.jobService.deleteSavedFile(job.filePath);

      Logger.log(`Job ${job.id} completed...`);
    }
  }
}
