import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserServiceInterface } from './user.service.interface';
import { CreateUserEmployeeDto } from './dto/create-user -employee.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { Employee } from '../employee/entities/employee.entity';
import { DataSource } from 'typeorm';
import { EmployeeService } from '../employee/employee.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService implements UserServiceInterface {
  private readonly saltOrRounds: number = 10;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly employeeService: EmployeeService,
  ) {}

  async getOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.getOneByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with Email: ${email} not found`);
    }
    return user;
  }

  // async createUser(createUserDto: CreateUserDto): Promise<User> {
  //   try {
  //     createUserDto.password = await bcrypt.hash(
  //       createUserDto.password,
  //       this.saltOrRounds,
  //     );
  //     return await this.userRepository.createUser(createUserDto);
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  async createUserWithEmployee(createUserDto: CreateUserEmployeeDto) {
    // 1. hash password
    createUserDto.password = await bcrypt.hash(
      createUserDto.password,
      this.saltOrRounds,
    );

    // 2. segregate employee details from user
    const {
      firstName,
      lastName,
      emp_email,
      role,
      password,
      cci_id,
      signup_status,
      ...empDetails
    } = createUserDto;

    try {
      // 3. create employee data
      const employee = await this.employeeService.createEmployee(empDetails);

      // 3. create user data
      const user = await this.userRepository.createUser({
        firstName: firstName,
        lastName: lastName,
        emp_email: emp_email,
        role: role,
        password: password,
        cci_id: cci_id,
        signup_status: signup_status,
        employee: employee,
      });
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async readEmail(email: string): Promise<User> {
    return await this.userRepository.getOneByEmail(email);
  }

  async findOne(id: string): Promise<User> {
    return await this.userRepository.getOneById(id);
  }

  async findByCCIid(cci_id: string): Promise<User | null> {
    return await this.userRepository.getUserByCCIid(cci_id);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        this.saltOrRounds,
      );
    }
    return await this.userRepository.updateData(id, updateUserDto);
  }

  deleteUser(id: string): Promise<string> {
    return this.userRepository.deleteData(id);
  }

  async getTotalUsers(): Promise<number> {
    return await this.userRepository.countUsers();
  }
}
