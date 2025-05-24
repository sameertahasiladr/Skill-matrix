import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDesignationDto {
  @ApiProperty({ description: 'Designation name' })
  @IsString()
  @IsNotEmpty()
  designation: string;
}
