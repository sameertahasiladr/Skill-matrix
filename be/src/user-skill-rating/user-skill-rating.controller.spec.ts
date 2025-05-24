import { Test, TestingModule } from '@nestjs/testing';
import { UserSkillRatingController } from './user-skill-rating.controller';
import { UserSkillRatingService } from './user-skill-rating.service';

describe('UserSkillRatingController', () => {
  let controller: UserSkillRatingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSkillRatingController],
      providers: [UserSkillRatingService],
    }).compile();

    controller = module.get<UserSkillRatingController>(UserSkillRatingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
