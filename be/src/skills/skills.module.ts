import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { LevelService } from './levels.service';
import { LevelController } from './levels.controller';
import { TagSkillsService } from './tagskills.service';
import { TagSkillsController } from './tagskills.controller';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { SkillMatrix } from './entities/skillMatrix.entity';
import { Levels } from './entities/levels.entity';
import { Tags } from './entities/tags.entity';
import { TagSkills } from './entities/tagskills.entity';
import { Legend } from '../master/entities/legend.entity';
import { MasterModule } from '../master/master.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SkillMatrix, Levels, Tags, TagSkills, Legend]),
    MasterModule,
  ],
  providers: [SkillsService, LevelService, TagSkillsService, TagsService],
  controllers: [
    SkillsController,
    LevelController,
    TagSkillsController,
    TagsController,
  ],
  exports: [
    SkillsService,
    LevelService,
    TagSkillsService,
    TagsService,
    TypeOrmModule,
  ],
})
export class SkillsModule {}
