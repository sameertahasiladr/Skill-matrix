import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserSkillRatingDto } from './create-user-skill-rating.dto';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateUserSkillRatingDto {
      @ApiProperty({ description: 'CCI Id of the employee' })
        @IsString()
        @IsNotEmpty()
        cci_id: string;
      
        @ApiProperty({ description: 'Main skill the user is familiar with' })
        @IsString()
        @IsNotEmpty()
        main_skill: string;
      
        @ApiProperty({ description: 'Updated level of proficiency in the main skill' })
        @IsString()
        @IsNotEmpty()
        level: string;
}
