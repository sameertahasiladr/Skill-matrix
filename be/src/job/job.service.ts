import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { FilterJobDto } from './dto/filter-job.dto';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
  ) {}

  /**
   * * this job takes care of skill matrix sheet upload
   * @argument fileBuffer stores the uploaded files
   * @argument fileName stores the original file name
   */
  async createJob(fileBuffer: Buffer, fileName: string, jobType: string) {
    // save uploaded file
    const filePath = await this.saveUploadedFile(fileBuffer, fileName);

    // initialise the job properties
    const jobInit = await this.jobRepository.create({
      jobType: jobType,
      status: 'Queued',
      uploadDate: new Date(),
      filePath: filePath,
    });
    const job = await this.jobRepository.save(jobInit);
    Logger.log(
      `Queued job details: ${job.id} - ${job.jobType} - ${job.status} - ${job.uploadDate} - ${job.filePath}`,
    );
    return job.id;
  }

  /**
   * * this method will save the files
   * @argument fileName original file name
   * @argument fileBuffer stores the uploaded file
   */
  saveUploadedFile(fileBuffer, fileName) {
    const uploadDir = path.join(__dirname, '../../../uploads'); // upload directory path
    const newFileName = `${fileName}-${Date.now()}.xlsx`; //save the original file name with current date
    const filePath = path.join(uploadDir, newFileName); // path to directory + filename

    // if directory doesn't exist, create one
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    // save the file in the mentioned path
    fs.writeFileSync(filePath, fileBuffer);
    console.log(`File saved at: ${filePath}`);
    return filePath;
  }

  /**
   * * this method will delete the saved files after processing
   * @argument fileName original file name
   * @argument fileBuffer stores the uploaded file
   */
  deleteSavedFile(filePath: string){
    try {
      fs.unlinkSync(filePath); 
      Logger.log(`File deleted: ${filePath}`);
    } catch (error) {
      Logger.error(`Error deleting file: ${error.message}`);
    }
  }

  /**
   * * this method return the details of the job
   * @argument jobID id of the job being fetched
   */
  async searchJobById(jobID: string) {
    // search if a job with such id exists
    const job = await this.jobRepository.findOne({ where: { id: jobID } });
    // if exists, return the details of the job
    if (job) {
      return {
        id: job.id,
        jobType: job.jobType,
        status: job.status,
        uploadDate: job.uploadDate,
        uploadSummary: job.uploadSummary,
        download: job.download,
      };
    } else {
      throw new HttpException(
        { message: `Job with ID: ${jobID} does not exist.` },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * * this method return job types
   */
  async getAllJobType() {
    try {
      const data = await this.jobRepository
        .createQueryBuilder('job')
        .select('DISTINCT job.jobType', 'jobType')
        .getRawMany();

      return data;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch job types.',
        error,
      );
    }
  }

  /**
   * * this method return all jobs
   * @param filterJobDto stores the jobType value for filtering
   */
  async getAllJobs(filterJobDto: FilterJobDto) {
    const jobType = filterJobDto.jobType;

    try {
      const jobData = await this.jobRepository.createQueryBuilder('jobs');

      if (jobType) {
        // partial match the job type
        jobData.andWhere('jobs.jobType LIKE :jobType', {
          jobType: `%${jobType}%`,
        });
      }
      // select only certain properties
      jobData.select([
        'jobs.id',
        'jobs.jobType',
        'jobs.status',
        'jobs.uploadDate',
        'jobs.uploadSummary',
        'jobs.download',
      ]);

      const jobs = await jobData.getMany();
      if (!jobs.length)
        return { message: `No job found for job type: ${jobType}` };
      return jobs;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch all jobs. ',
        error,
      );
    }
  }
}
