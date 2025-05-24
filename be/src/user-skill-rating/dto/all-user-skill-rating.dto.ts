import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AllUserSkillRatingDto {
  @ApiProperty({ description: 'CCI Id of the employee' })
  @IsString()
  @IsNotEmpty()
  cci_id: string;

  @ApiProperty({ description: 'CCI Id of the employee' })
  @IsString()
  @IsNotEmpty()
  main_skill: string;

  @ApiProperty({ description: 'CCI Id of the employee' })
  @IsString()
  @IsNotEmpty()
  level: string;
}
