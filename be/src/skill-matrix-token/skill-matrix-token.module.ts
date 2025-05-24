import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillMatrixToken } from './entities/skill-matrix-token.entity';
import { Role } from '../master/entities/role.entity';
import { Designation } from '../master/entities/designation.entity';
import { SkillMatrixTokenService } from './skill-matrix-token.service';
import { SkillMatrixTokenController } from './skill-matrix-token.controller';
import { PdfGeneratorService } from '../pdf-generator/pdf-generator.service';
import { SkillMatrix } from '../skills/entities/skillMatrix.entity';
import { Legend } from '../master/entities/legend.entity';
import { Tags } from '../skills/entities/tags.entity'; // ADD THIS
import { TagSkills } from '../skills/entities/tagskills.entity'; // ADD THIS
import { SkillsModule } from '../skills/skills.module'; // Import existing module if needed

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SkillMatrixToken,
      Role,
      Designation,
      SkillMatrix,
      Legend,
      Tags, //  Register Tag
      TagSkills, // Register TagSkills if needed
    ]),
    SkillsModule, // Optional: bring in all repo/providers from skills module
  ],
  providers: [SkillMatrixTokenService, PdfGeneratorService],
  controllers: [SkillMatrixTokenController],
})
export class SkillMatrixTokenModule {}
