import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  @ApiProperty({
    description: 'Enter CCI ID',
  })
  @IsString()
  @IsNotEmpty()
  cci_id: string;
}
