import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: 'CCI ID',
  })
  @IsString()
  @IsNotEmpty()
  cci_id: string;

  @ApiProperty({
    description: 'Role of the user',
  })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    description: "User's first name",
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: "User's last name",
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;
}