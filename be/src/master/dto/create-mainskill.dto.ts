import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMainSkillDto {
  @ApiProperty({ description: 'Main skill name' })
  @IsString()
  @IsNotEmpty()
  mainSkill: string;
}
