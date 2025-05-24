import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({ description: 'The name of the skill' })
  @IsNotEmpty()
  @IsString()
  skills: string;

  @ApiProperty({ description: 'A description of the skill', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'An example of the skill', required: false })
  @IsOptional()
  @IsString()
  example?: string;

  @ApiProperty({
    description: 'Responsibilities related to the skill',
    required: false,
  })
  @IsOptional()
  @IsString()
  responsibilities?: string;

  @ApiProperty({ description: 'The level ID for the skill' })
  @IsNotEmpty()
  @IsUUID()
  levels_id: string;

  @ApiProperty({ description: 'The role ID for the skill' })
  @IsNotEmpty()
  @IsString()
  role_id: string;

  @ApiProperty({ description: 'The designation ID for the skill' })
  @IsNotEmpty()
  @IsString()
  designation_id: string;

  @ApiProperty({ description: 'The mainskill ID for the skill' })
  @IsNotEmpty()
  @IsString()
  mainSkill_id: string;
}
