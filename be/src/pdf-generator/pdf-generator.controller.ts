import { Controller, Get, Query, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { PdfGeneratorService } from './pdf-generator.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role as RoleEnum} from '../auth/enums/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('pdf')
export class PdfGeneratorController {
  constructor(private readonly pdfService: PdfGeneratorService) {}

  @Roles(RoleEnum.Admin, RoleEnum.User)
  @UseGuards(RolesGuard)
  @Get('skills/:role/:designation/:tags')
  @ApiOperation({
    summary: 'Generate PDF for specified role, designation & tags',
  })
  @ApiResponse({ status: 200, description: 'Successfully generated the PDF' })
  async generatePdf(
    @Res() response: Response,
    @Param('role') role: string,
    @Param('designation') designation: string,
    @Param('tags') tags: string,
  ) {
    return this.pdfService.generatePdf(response, role, designation, tags);
  }

  @Roles(RoleEnum.Admin, RoleEnum.User)
  @UseGuards(RolesGuard)
  @Get('data/skills/:role/:designation/:tags')
  @ApiOperation({
    summary: 'Fetch skills based on the specified role, designation & tags',
  })
  @ApiResponse({ status: 200, description: 'Successfully fetched the data' })
  async getFilteredData(
    @Param('role') role: string,
    @Param('designation') designation: string,
    @Param('tags') tags: string,
  ) {
    return this.pdfService.getFilteredData(role, designation, tags);
  }


  @Roles(RoleEnum.Admin, RoleEnum.User)
  @UseGuards(RolesGuard)
  @Get('data/load-matrix/:role/:designation/:tags')
  @ApiOperation({
    summary: 'Fetch only visible skills based on role, designation & tags',
  })
  @ApiResponse({ status: 200, description: 'Successfully fetched only visible skills' })
  async loadVisibleMatrix(
    @Param('role') role: string,
    @Param('designation') designation: string,
    @Param('tags') tags: string,
  ) {
    return this.pdfService.loadMatrixWithVisibleSkills(role, designation, tags);
  }
  
  }
