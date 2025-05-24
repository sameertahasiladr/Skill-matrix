import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
 
export class ResetPasswordDto {
  @ApiProperty({
    description: 'Enter CCI ID',
  })
  @IsString()
  @IsNotEmpty()
  cci_id: string;

  @ApiProperty({
    description: 'Enter new password',
    example: 'Test@123',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    description: 'Enter to confirm password',
    example: 'Test@123',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  confirm_password: string;
}