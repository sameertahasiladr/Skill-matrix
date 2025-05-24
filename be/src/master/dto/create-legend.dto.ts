import { IsString, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLegendDto {
  @ApiProperty({ description: 'The ID of the designation' })
  @IsUUID()
  @IsNotEmpty()
  designationId: string;

  @ApiProperty({ description: 'The ID of the role' })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;

  @ApiProperty({ description: 'The ID of the main skill' })
  @IsUUID()
  @IsNotEmpty()
  mainSkillId: string;

  @ApiProperty({ description: 'A description for the master record' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
