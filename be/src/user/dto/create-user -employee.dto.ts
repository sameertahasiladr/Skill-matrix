import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserEmployeeDto {
  @ApiProperty({ description: 'First name of the user' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Email address of the user' })
  @IsNotEmpty()
  @IsEmail()
  emp_email: string;

  @ApiProperty({
    description: 'User role (admin or user)',
    enum: ['admin', 'user'],
    required: false,
  })
  @IsOptional()
  @IsString()
  role: string;

  @ApiProperty({ description: 'Password', required: true })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'CCI ID', required: true })
  @IsString()
  @IsNotEmpty()
  cci_id: string;

  @ApiProperty({ description: 'Signup status', default: 'Inactive' })
  @IsString()
  @IsNotEmpty()
  signup_status: string;

  @ApiProperty({ description: 'Date of Joining' })
  @IsDate()
  @IsNotEmpty()
  date_of_joining: Date;

  @ApiProperty({ description: 'Reporting to' })
  @IsString()
  @IsNotEmpty()
  reporting_to: string;

  @ApiProperty({ description: 'Current Grade' })
  @IsString()
  @IsNotEmpty()
  current_grade: string;

  @ApiProperty({ description: 'Current Location' })
  @IsString()
  @IsNotEmpty()
  current_location: string;

  @ApiProperty({ description: 'Present City' })
  @IsString()
  @IsNotEmpty()
  present_city: string;

  @ApiProperty({ description: 'Present State' })
  @IsString()
  @IsNotEmpty()
  present_state: string;

  @ApiProperty({ description: 'Current Department' })
  @IsString()
  @IsNotEmpty()
  current_dept: string;

  @ApiProperty({ description: 'Current Designation for Reporting' })
  @IsString()
  @IsNotEmpty()
  curr_designation_for_reporting: string;

  @ApiProperty({ description: 'Date of Current Designation' })
  @IsDate()
  @IsNotEmpty()
  curr_designation_since: Date;

  @ApiProperty({ description: 'Employment Status' })
  @IsString()
  @IsNotEmpty()
  employment_status: string;

  @ApiProperty({ description: 'User Group' })
  @IsString()
  @IsNotEmpty()
  user_group: string;

  @ApiProperty({
    description: 'Personal interests of the employee',
    example: 'Singing',
  })
  @IsString()
  readonly personal_interests: string;

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

  @ApiProperty({ description: 'Current designation ID (UUID format)' })
  readonly current_designation: string;
}
