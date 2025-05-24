import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterService } from './master.service';
import { MasterController } from './master.controller';
import { Legend } from './entities/legend.entity';
import { Designation } from './entities/designation.entity';
import { Role } from './entities/role.entity';
import { MainSkill } from './entities/mainskill.entity';

import { DesignationService } from './designation.service';
import { DesignationController } from './designation.controller';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { MainSkillService } from './mainskill.service';
import { MainSkillController } from './mainskill.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Legend, Designation, Role, MainSkill])],
  controllers: [
    MasterController,
    DesignationController,
    RoleController,
    MainSkillController,
  ],
  providers: [MasterService, DesignationService, RoleService, MainSkillService],
})
export class MasterModule {}
