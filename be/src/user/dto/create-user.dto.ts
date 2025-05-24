import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Employee } from '../../employee/entities/employee.entity';
import { DeepPartial } from 'typeorm';

export class CreateUserDto {
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
  @IsString()
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

  @ApiProperty({ description: 'Employee details' })
  @IsNotEmpty()
  employee: DeepPartial<Employee>;
}
