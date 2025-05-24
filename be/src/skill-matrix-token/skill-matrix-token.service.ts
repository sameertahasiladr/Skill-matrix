import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SkillMatrixToken } from './entities/skill-matrix-token.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../master/entities/role.entity';
import { Designation } from '../master/entities/designation.entity';
import * as nodemailer from 'nodemailer';
@Injectable()
export class SkillMatrixTokenService {
  constructor(
    @InjectRepository(SkillMatrixToken)
    private readonly tokenRepo: Repository<SkillMatrixToken>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Designation)
    private readonly designationRepo: Repository<Designation>,
  ) {}

  async generateToken(roleTitle: string, designationTitle: string): Promise<SkillMatrixToken> {
    const role = await this.roleRepo.findOne({ where: { title: roleTitle } });
    const designation = await this.designationRepo.findOne({ where: { designation: designationTitle } });

    if (!role || !designation) throw new NotFoundException('Role or Designation not found');

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    const newToken = this.tokenRepo.create({
      token,
      role,
      designation,
      expiresAt,
    });

    return this.tokenRepo.save(newToken);
  }

  async validateToken(token: string): Promise<SkillMatrixToken> {
    const tokenData = await this.tokenRepo.findOne({
      where: { token },
      relations: ['role', 'designation'],
    });

    if (!tokenData || new Date() > tokenData.expiresAt) {
      throw new UnauthorizedException('Token is invalid or expired');
    }

    return tokenData;
  }

  async sendTokenEmail(to: string, link: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: 'Skill Matrix <your-email@gmail.com>',
      to,
      subject: 'Your Skill Matrix Link',
      html: `
      <html>
        <body>
          <p> <strong>Hi</strong>,</p>
          <p>Here is your skill matrix link:</p>
      
          <a href="${link}" 
             style="background-color: #28a745; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; display: inline-block; 
                    margin-bottom: 20px;">
            View Skill Matrix
          </a>
      
          <p style="margin-top: 10px;">Please note that this link will expire in 1 hour.</p>
      
          <p style="margin-top: 20px;">Thanks,<br/>Your Skill App Team</p>
        </body>
      </html>
      `
      
    };

    await transporter.sendMail(mailOptions);
  }

}
