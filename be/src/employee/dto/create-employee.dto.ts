import {
  IsUUID,
  IsString,
  IsDate,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'Date of joining the company' })
  @IsDate()
  readonly date_of_joining: Date;

  @ApiProperty({
    description: 'Date of leaving the company (if applicable)',
    required: false,
  })
  @IsDate()
  @IsOptional()
  readonly date_of_leaving?: Date;

  @ApiProperty({ description: 'Current grade of the employee' })
  @IsString()
  readonly current_grade: string;

  @ApiProperty({
    description: 'Current experience of the employee in years',
    example: 2.03,
  })
  @IsNumber()
  readonly current_experience: number;

  @ApiProperty({
    description: 'Previous employment experience in years',
    example: 1.0,
  })
  @IsNumber()
  readonly prev_emp_experience: number;

  @ApiProperty({
    description: 'Years served in the current designation',
    example: 2.0,
  })
  @IsNumber()
  readonly years_served_in_curr_designation: number;

  @ApiProperty({
    description: 'Date since the employee holds the current designation',
  })
  @IsDate()
  readonly curr_designation_since: Date;

  @ApiProperty({
    description: 'Current employment status',
    examples: ['Active', 'Maternity'],
  })
  @IsString()
  readonly employment_status: string;

  @ApiProperty({
    description: 'Personal interests of the employee',
    example: 'Singing',
  })
  @IsString()
  readonly personal_interests: string;

  @ApiProperty({
    description: 'Current department of the employee',
    example: 'Eng Dev - Database',
  })
  @IsString()
  readonly current_dept: string;

  @ApiProperty({ description: 'Current designation ID (UUID format)' })
  readonly current_designation: string;

  @ApiProperty({ description: 'User group of the employee', example: 'Web' })
  readonly user_group: string;

  @ApiProperty({ description: 'Current designation for reporting purposes' })
  @IsString()
  readonly curr_designation_for_reporting: string;

  @ApiProperty({
    description: 'Who the employee is reporting to',
    required: false,
  })
  @IsOptional()
  readonly reporting_to: string;

  @ApiProperty({
    description: 'Present location',
    required: false,
  })
  @IsOptional()
  readonly current_location: string;

  @ApiProperty({
    description: 'Present city',
    required: false,
  })
  @IsOptional()
  readonly present_city: string;

  @ApiProperty({
    description: 'Present state',
    required: false,
  })
  @IsOptional()
  readonly present_state: string;

  @ApiProperty({
    description: 'First client)',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly current_client_one: string;

  @ApiProperty({
    description: 'Second client',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly current_client_two: string;

  @ApiProperty({
    description: 'Third client',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly current_client_three: string;

  @ApiProperty({
    description: 'Fourth client',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly current_client_four: string;

  @ApiProperty({
    description: 'Current business system qualifications',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly current_business_sys_qualifications: string;

  @ApiProperty({
    description: 'Stack of core technologies',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly current_core_tech_stack: string;

  @ApiProperty({
    description: 'Stack of secondary technologies',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly current_secondary_tech_stack: string;
}
