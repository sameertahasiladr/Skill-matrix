import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({
    description: 'CCI ID',
  })
  @IsString()
  @IsNotEmpty()
  cci_id: string;

  @ApiProperty({
    description: 'Account password',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
