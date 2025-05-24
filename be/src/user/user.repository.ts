import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserEmployeeDto } from './dto/create-user -employee.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async getUserByCCIid(cci_id: string): Promise<User | null> {
    const user = await this.findOneBy({ cci_id: cci_id });
    if (!user) {
      // is user not found then return null
      return null;
    }
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Create a new user entity
      const newUser = this.create(createUserDto);

      // Save the user to the database
      console.log('user details from repository: ', newUser);
      await this.save(newUser);
      return newUser;
    } catch (error) {
      // Handle duplicate email error
      if (error.code === '23505') {
        throw new BadRequestException(
          `User with Email: ${createUserDto.emp_email} already exists`,
        );
      }

      // Handle unexpected errors
      throw new InternalServerErrorException(
        `${UserRepository.name}/createUser: ${error.message}`,
      );
    }
  }

  async getOneByEmail(email: string): Promise<User> {
    const user = await this.findOneBy({ emp_email: email });
    if (!user) {
      throw new NotFoundException(`User with Email: ${email} not found`);
    }
    return user;
  }

  async getOneById(id: string): Promise<User> {
    const user = await this.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException(`User with ID: ${id} not found`);
    }
    return user;
  }

  async updateData(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const data = await this.getOneById(id);
    try {
      const updateData = Object.assign(data, updateUserDto);
      const updatedData = await this.save(updateData);
      return updatedData;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
        `${UserRepository.name}/updateData`,
      );
    }
  }

  async deleteData(id: string): Promise<string> {
    await this.getOneById(id);
    try {
      const result = await this.softDelete(id);
      if (result.affected !== 0) {
        return `user with ID: ${id} removed.`;
      } else {
        return `user with ID: ${id} not removed.`;
      }
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
        `${UserRepository.name}/deleteData`,
      );
    }
  }

  async countUsers(): Promise<number> {
    return await this.count();
  }
  
}
