import { CreateUserEmployeeDto } from './dto/create-user -employee.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

export interface UserServiceInterface {
  createUserWithEmployee(createUserDto: CreateUserEmployeeDto);

  // createUser(createUserDto: CreateUserEmployeeDto): Promise<User>;

  readEmail(email: string): Promise<User>;

  findOne(id: string): Promise<User>;

  updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User>;

  deleteUser(id: string): Promise<string>;

  findByCCIid(cci_id: string): Promise<User | null>;

  getTotalUsers(): Promise<number>;
}
