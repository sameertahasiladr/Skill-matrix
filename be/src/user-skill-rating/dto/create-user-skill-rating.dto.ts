import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserSkillRatingDto {
  @ApiProperty({ description: 'CCI Id of the employee' })
  @IsString()
  @IsNotEmpty()
  cci_id: string;

  @ApiProperty({ description: 'Main skill the user is familiar with' })
  @IsString()
  @IsNotEmpty()
  main_skill: string;

  @ApiProperty({ description: 'Level of proficiency in the main skill' })
  @IsString()
  @IsNotEmpty()
  level: string;
}
