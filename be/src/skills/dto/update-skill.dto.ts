import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
 
export class UpdateSkillDto {
  @ApiProperty({
    description: 'Pass skill id',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
 
  @ApiProperty({
    description: 'Pass updated order number',
    example: '3',
  })
  @IsNumber()
  @IsNotEmpty()
  orderNo: number;
 
  @ApiProperty({
    description: 'Pass updated isVisible value',
    example: 'False',
  })
  @IsBoolean()
  @IsNotEmpty()
  isVisible: boolean;
}
