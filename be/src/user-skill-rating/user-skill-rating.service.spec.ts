import { Test, TestingModule } from '@nestjs/testing';
import { UserSkillRatingService } from './user-skill-rating.service';

describe('UserSkillRatingService', () => {
  let service: UserSkillRatingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSkillRatingService],
    }).compile();

    service = module.get<UserSkillRatingService>(UserSkillRatingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
