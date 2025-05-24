import { ApiProperty } from '@nestjs/swagger';

export class CreateLevelDto {
  @ApiProperty({ description: 'The level name' })
  readonly level: string;

  @ApiProperty({ description: 'The description of the level' })
  readonly description: string;
}
