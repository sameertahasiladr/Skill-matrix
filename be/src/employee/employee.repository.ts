import { EntityRepository, Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';

@EntityRepository(Employee)
export class EmployeeRepository extends Repository<Employee> {
  
  async createEmployee(employeeData: Partial<Employee>) {
    const employee = this.create(employeeData); 
    return await this.save(employee); 
  }
}
