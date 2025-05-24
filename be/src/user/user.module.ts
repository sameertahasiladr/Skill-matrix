import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExcelService } from '../excel/excel.service';
import { ExcelModule } from '../excel/excel.module';
import { JobModule } from '../job/job.module';
import { JobService } from '../job/job.service';
import { Employee } from '../employee/entities/employee.entity';
import { EmployeeService } from '../employee/employee.service';
import { EmployeeModule } from '../employee/employee.module';
import { Designation } from '../master/entities/designation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Employee, Designation]), forwardRef(() => ExcelModule)],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: 'UserServiceInterface',
      useClass: UserService,
    },
    UserRepository,
    EmployeeService
  ],
  exports: [UserService, 'UserServiceInterface', UserRepository],
})
export class UserModule {}
