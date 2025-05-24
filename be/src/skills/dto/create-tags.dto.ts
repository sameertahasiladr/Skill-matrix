import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ description: 'The tag name' })
  @IsNotEmpty()
  tags: string;
}
