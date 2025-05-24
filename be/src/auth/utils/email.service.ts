import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendResetPasswordEmail(to: string, fullName: string, resetUrl: string) {
    const subject = "Reset Your Password";
    const html = this.getResetEmailTemplate(fullName, resetUrl);
  
    const info = await this.transporter.sendMail({
      from: `"Skill App" <${this.configService.get('EMAIL_USER')}>`,
      to,
      subject,
      html,
    });
  
    console.log('Email sent: ', info.messageId);
  }
  
  private getResetEmailTemplate(fullName: string, resetUrl: string): string {
    return `
<html>
  <body>
    <p>Hi <strong>${fullName}</strong>,</p>
    <p>We received your request to reset your password.</p>
    <p>Click the link below to reset your password:</p>

    <a href="${resetUrl}" 
       style="background-color: #007bff; color: white; padding: 10px 20px; 
              text-decoration: none; border-radius: 5px; display: inline-block; 
              margin-bottom: 20px;">
      Reset Password
    </a>

    <p style="margin-top: 10px;">If you didn't request this, please ignore this email.</p>

    <p style="margin-top: 20px;">Thanks,<br/>Your Skill App Team</p>
  </body>
</html>

    `;
  }
  
}
