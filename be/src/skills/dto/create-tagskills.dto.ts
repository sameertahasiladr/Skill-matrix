import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagSkillsDto {
  @ApiProperty({ description: 'The skill ID' })
  @IsUUID()
  skills_id: string;

  @ApiProperty({ description: 'The tag ID' })
  @IsUUID()
  tags_id: string;
}
