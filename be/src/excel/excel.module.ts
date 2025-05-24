import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExcelService } from './excel.service';
import { ExcelController } from './excel.controller';
import { Levels } from '../skills/entities/levels.entity';
import { SkillMatrix } from '../skills/entities/skillMatrix.entity';
import { Tags } from '../skills/entities/tags.entity';
import { TagSkills } from '../skills/entities/tagskills.entity';
import { Designation } from '../master/entities/designation.entity';
import { MainSkill } from '../master/entities/mainskill.entity';
import { Legend } from '../master/entities/legend.entity';
import { Role } from '../master/entities/role.entity';
import { Job } from '../job/entities/job.entity';
import { JobService } from '../job/job.service';
import { JobModule } from '../job/job.module';
import { User } from '../user/entities/user.entity';
import { Employee } from '../employee/entities/employee.entity';
import { UserModule } from '../user/user.module';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Levels,
      SkillMatrix,
      Tags,
      TagSkills,
      Designation,
      MainSkill,
      Legend,
      Role,
      Job,
      User,
      Employee,
    ]),
    JobModule,
  ],
  providers: [ExcelService, JobService],
  controllers: [ExcelController],
  exports: [ExcelService],
})
export class ExcelModule {}
