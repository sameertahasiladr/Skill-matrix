import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UploadSummary } from '../uploadSummary.interface';


export class CreateJobDto {
  @ApiProperty({
    description: 'Job Type',
    example: 'File Upload',
  })
  @IsNotEmpty({
    message: 'Job type is required',
  })
  @IsString({
    message: 'Job type must be a string',
  })
  jobType: string;

  @ApiProperty({
    description: 'Job status',
    example: 'Completed',
  })
  @IsNotEmpty({
    message: 'Job status is required',
  })
  @IsString({
    message: 'Job status must be a string',
  })
  status: string;

  @ApiProperty({
    description: "Uploaded file's path",
  })
  @IsNotEmpty({
    message: 'File path is required',
  })
  @IsString({
    message: 'File path must be a string',
  })
  filePath: string;

  @ApiProperty({
    description: 'Upload date',
    example: 'dd-mm-yyyy',
  })
  @IsNotEmpty({
    message: 'Upload date is required',
  })
  uploadDate: Date;

  @ApiProperty({
    description: 'Upload summary',
  })
  uploadSummary?: UploadSummary;

  @ApiProperty({
    description: 'Download',
  })
  download?: string;
}
