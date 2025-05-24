import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { JobService } from '../job/job.service';
import { ExcelService } from './excel.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/roles.enum';

@ApiTags('Excel Sheet')
@Controller('excel')
export class ExcelController {
  constructor(
    private readonly jobService: JobService,
    private readonly excelService: ExcelService,
  ) {}

  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Post('upload/skillmatrix')
  @ApiOperation({ summary: 'Upload a new skill matrix excel sheet' })
  @ApiResponse({ status: 201, description: 'Successfully uploaded' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a skill matrix excel file',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSkillMatrixExcel(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string | { message: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    // define required cols for skill matrix
    const expectedFields = [
      'Role',
      'Skill',
      'Main Skill',
      'Description',
      'Examples',
    ];

    // check if correct file is being inserted
    await this.excelService.validExcelFile(file.buffer, expectedFields);

    const fileName = file.originalname; // fetch the upload file name
    try {
      const jobId = await this.jobService.createJob(
        file.buffer,
        fileName,
        'Skill File Upload',
      );
      return jobId;
    } catch (error) {
      return { message: `Excel file failed to upload. ${error}` };
    }
  }

  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Post('upload/employee')
  @ApiOperation({ summary: 'Upload a new employee excel sheet' })
  @ApiResponse({ status: 201, description: 'Successfully uploaded' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload employee excel file',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadEmployeeExcel(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string | { message: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    // define required cols for skill matrix
    const expectedFields = ['Employee Number', 'Email'];

    // check if correct file is being inserted
    await this.excelService.validExcelFile(file.buffer, expectedFields);

    const fileName = file.originalname;
    try {
      const jobId = await this.jobService.createJob(
        file.buffer,
        fileName,
        'Employee File Upload',
      );
      return jobId;
    } catch (error) {
      return { message: `Excel file failed to upload. ${error}` };
    }
  }
}
