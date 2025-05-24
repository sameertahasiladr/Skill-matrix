import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role title' })
  @IsString()
  @IsNotEmpty()
  title: string;
}
