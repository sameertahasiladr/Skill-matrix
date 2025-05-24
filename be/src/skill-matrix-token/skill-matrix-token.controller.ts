import { Controller, Get, Query,Res, Param, UseGuards } from '@nestjs/common';
import { SkillMatrixTokenService } from './skill-matrix-token.service';
import { PdfGeneratorService } from '../pdf-generator/pdf-generator.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role as RoleEnum } from '../auth/enums/roles.enum';
import { Response } from 'express';
@Controller('pdf')
export class SkillMatrixTokenController {
  constructor(
    private readonly tokenService: SkillMatrixTokenService,
    private readonly pdfService: PdfGeneratorService,
  ) {}


  // Authenticated endpoint to generate token AND send email
  @Roles(RoleEnum.Admin, RoleEnum.User)
  @UseGuards(RolesGuard)
  @Get('generate-token/:role/:designation')
  async generateTokenAndSendEmail(
    @Param('role') role: string,
    @Param('designation') designation: string,
    @Query('email') email: string, //  accept email as query
  ) {
    const tokenEntity = await this.tokenService.generateToken(role, designation);

    const shareableUrl = `http://localhost:3000/public-skill-matrix?token=${tokenEntity.token}&tags=common`;

    if (email) {
      await this.tokenService.sendTokenEmail(email, shareableUrl); // send email
    }

    return {
      token: tokenEntity.token,
      expiresAt: tokenEntity.expiresAt,
      shareableUrl,
      emailSentTo: email || 'not provided',
    };
  }
  // Public endpoint to load skill matrix using token
  @Get('public/skills')
  async generatePdfViaToken(
    @Query('token') token: string,
    @Query('tags') tags: string,
    @Res() res: Response,
  ) {
    const tokenData = await this.tokenService.validateToken(token);
  
    // Directly call the PDF service with response object
    await this.pdfService.generatePdf(
      res,
      tokenData.role.title,
      tokenData.designation.designation,
      tags,
    );
  }
}
