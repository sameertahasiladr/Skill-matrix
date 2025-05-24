import { PartialType } from '@nestjs/mapped-types';
import { CreateUserEmployeeDto } from './create-user -employee.dto';

export class UpdateUserDto extends PartialType(CreateUserEmployeeDto) {}
