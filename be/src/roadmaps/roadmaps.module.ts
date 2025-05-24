import { Module } from '@nestjs/common';
import { RoadmapsService } from './roadmaps.service';
import { RoadmapsController } from './roadmaps.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entities/employee.entity';
import { Job } from '../job/entities/job.entity';
import { Designation } from '../master/entities/designation.entity';
import { Legend } from '../master/entities/legend.entity';
import { MainSkill } from '../master/entities/mainskill.entity';
import { Role } from '../master/entities/role.entity';
import { Levels } from '../skills/entities/levels.entity';
import { SkillMatrix } from '../skills/entities/skillMatrix.entity';
import { Tags } from '../skills/entities/tags.entity';
import { TagSkills } from '../skills/entities/tagskills.entity';
import { User } from '../user/entities/user.entity';
import { ExcelService } from '../excel/excel.service';

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
  ],
  controllers: [RoadmapsController],
  providers: [RoadmapsService, ExcelService],
})
export class RoadmapsModule {}
