import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Employee } from './entities/employee.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Employee')
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully', type: Employee })
  async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    return this.employeeService.createEmployee(createEmployeeDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee details by ID' })
  @ApiResponse({ status: 200, description: 'Employee data', type: Employee })
  async getEmployeeById(@Param('id') id: string): Promise<Employee> {
    return this.employeeService.getEmployeeById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'List of employees', type: [Employee] })
  async getAllEmployees(): Promise<Employee[]> {
    return this.employeeService.getAllEmployees();
  }
}
