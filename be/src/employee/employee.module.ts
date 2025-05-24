import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { Employee } from './entities/employee.entity';
import { UserModule } from 'src/user/user.module';
import { Designation } from 'src/master/entities/designation.entity';
import { ExcelModule } from '../excel/excel.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Designation]),
    UserModule,
    ExcelModule,
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
