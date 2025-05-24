import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSkillRatingService } from './user-skill-rating.service';
import { UserSkillRatingController } from './user-skill-rating.controller';
import { UserSkillRating } from './entities/user-skill-rating.entity';
import { MainSkill } from '../master/entities/mainskill.entity';
import { Levels } from '../skills/entities/levels.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSkillRating, Levels, MainSkill]), UserModule],
  controllers: [UserSkillRatingController],
  providers: [UserSkillRatingService],
  exports: [UserSkillRatingService]
})
export class UserSkillRatingModule {}
