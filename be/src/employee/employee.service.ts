import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UserRepository } from 'src/user/user.repository';
import { Designation } from 'src/master/entities/designation.entity';
import { ExcelService } from '../excel/excel.service';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly excelService: ExcelService,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(Designation)
    private readonly designationRepository: Repository<Designation>,
  ) {}

  async getAllEmployees(): Promise<Employee[]> {
    const employees = await this.employeeRepository.find({
      relations: ['user'],
    });

    console.log('Retrieved Employees:', employees);
    return employees;
  }
  async getEmployeeById(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['user', 'current_designation'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found.`);
    }

    console.log('Retrieved Employee:', employee);
    return employee;
  }

  async createEmployee(createEmployeeDto: CreateEmployeeDto) {
    // clean the designation & map it
    let curr_designation = createEmployeeDto.current_designation;
    curr_designation = await this.excelService.cleanStrings(curr_designation);
    curr_designation = await this.excelService.mapDesignation(curr_designation);

    //  find the id of designation
    const designation = await this.designationRepository.findOne({
      where: { designation: curr_designation },
    });

    if (!designation) {
      throw new NotFoundException('Designation not found');
    }

    const employee = this.employeeRepository.create({
      ...createEmployeeDto,
      current_designation: designation,
    });

    return this.employeeRepository.save(employee);
  }
}
