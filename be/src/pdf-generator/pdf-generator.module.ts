import { Module } from '@nestjs/common';
import { PdfGeneratorService } from './pdf-generator.service';
import { PdfGeneratorController } from './pdf-generator.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillMatrix } from '../skills/entities/skillMatrix.entity';
import { Legend } from '../master/entities/legend.entity';
import { Tags } from '../skills/entities/tags.entity';
import { TagSkills } from '../skills/entities/tagskills.entity';
import { Levels } from 'src/skills/entities/levels.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SkillMatrix, Legend, Tags, TagSkills,Levels])],
  controllers: [PdfGeneratorController],
  providers: [PdfGeneratorService],
})
export class PdfGeneratorModule {}
