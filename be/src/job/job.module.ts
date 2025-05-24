import { forwardRef, Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { ExcelService } from '../excel/excel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Designation } from '../master/entities/designation.entity';
import { Legend } from '../master/entities/legend.entity';
import { MainSkill } from '../master/entities/mainskill.entity';
import { Role } from '../master/entities/role.entity';
import { Levels } from '../skills/entities/levels.entity';
import { SkillMatrix } from '../skills/entities/skillMatrix.entity';
import { Tags } from '../skills/entities/tags.entity';
import { TagSkills } from '../skills/entities/tagskills.entity';
import { Job } from './entities/job.entity';
import { JobSchedulerService } from './job-scheduler.service';
import { User } from '../user/entities/user.entity';
import { Employee } from '../employee/entities/employee.entity';
import { UserModule } from '../user/user.module';

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
    forwardRef(() => UserModule),
  ],
  controllers: [JobController],
  providers: [JobService, ExcelService, JobSchedulerService],
  exports: [JobService],
})
export class JobModule {}
