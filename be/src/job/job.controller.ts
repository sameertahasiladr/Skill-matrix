import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobService } from './job.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role as RoleEnum } from '../auth/enums/roles.enum';
import { FilterJobDto } from './dto/filter-job.dto';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Roles(RoleEnum.Admin, RoleEnum.User)
  @UseGuards(RolesGuard)
  @Get('search/:jobId')
  @ApiOperation({ summary: 'Search a job by the job id' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched the job details',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, job id not provided',
  })
  @ApiResponse({
    status: 404,
    description: 'Job with provided id not found',
  })
  async uploadSkillMatrixExcel(@Param('jobId') jobId: string) {
    // if job id is not provided
    if (!jobId)
      throw new HttpException(
        { message: 'No job id provided' },
        HttpStatus.BAD_REQUEST,
      );

    const jobDetails = await this.jobService.searchJobById(jobId);

    // if job details are returned
    if (jobDetails) return jobDetails;
  }

  @Roles(RoleEnum.Admin)
  @UseGuards(RolesGuard)
  @Get('job-type')
  @ApiOperation({ summary: 'Fetch all job types' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched the job types',
  })
  async fetchAllJobType() {
    return await this.jobService.getAllJobType();
  }

  @Roles(RoleEnum.Admin)
  @UseGuards(RolesGuard)
  @Get('job-list')
  @ApiOperation({
    summary:
      'Fetch all jobs depending on the job type filter if filter is passed',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched all jobs',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to fetch all the jobs due to internal error',
  })
  async fetchAllJobs(@Query() filterJobsDto: FilterJobDto) {
    return await this.jobService.getAllJobs(filterJobsDto);
  }
}
