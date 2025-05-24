import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserSkillRatingDto } from './dto/create-user-skill-rating.dto';
import { UpdateUserSkillRatingDto } from './dto/update-user-skill-rating.dto';
import { AllUserSkillRatingDto } from './dto/all-user-skill-rating.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { UserSkillRating } from './entities/user-skill-rating.entity';
import { MainSkill } from '../master/entities/mainskill.entity';
import { Levels } from '../skills/entities/levels.entity';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class UserSkillRatingService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Levels)
    private readonly levelRepository: Repository<Levels>,
    @InjectRepository(UserSkillRating)
    private readonly userRatingRepository: Repository<UserSkillRating>,
    @InjectRepository(MainSkill)
    private readonly mainSkillRepository: Repository<MainSkill>,
  ) {}
  async create(createUserSkillRatingDto: CreateUserSkillRatingDto) {
    // 1. check if the user with this cci id exist
    const user = await this.userRepository.findOne({
      where: { cci_id: createUserSkillRatingDto.cci_id },
    });
    if (!user)
      throw new NotFoundException(
        `User with cci id ${createUserSkillRatingDto.cci_id} does not exists.`,
      );

    // 2. check if the mainSkill with this id exist
    const mainSkill = await this.mainSkillRepository.findOne({
      where: { mainSkill: createUserSkillRatingDto.main_skill },
    });
    if (!mainSkill)
      throw new NotFoundException(
        `${createUserSkillRatingDto.main_skill} main skill does not exists.`,
      );

    // 3. check if the level with this id exist
    const level = await this.levelRepository.findOne({
      where: { level: createUserSkillRatingDto.level },
    });
    if (!level)
      throw new NotFoundException(
        `${createUserSkillRatingDto.level} level does not exists.`,
      );
    // 4. check if a record with these details exist

    let rating = await this.userRatingRepository.findOne({
      where: {
        cci_id: createUserSkillRatingDto.cci_id,
        mainSkill: mainSkill,
        level: level,
      },
    });

    if (rating)
      throw new ConflictException(
        `${createUserSkillRatingDto.main_skill} already exists on your dashboard`,
      );

    // 5. create a new record
    try {
      rating = await this.userRatingRepository.create({
        cci_id: createUserSkillRatingDto.cci_id,
        mainSkill: mainSkill,
        level: level,
      });

      this.userRatingRepository.save(rating);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to save the record. ',
        error,
      );
    }

    return {
      message: `User skill rating record for user ${createUserSkillRatingDto.cci_id}, main skill ${createUserSkillRatingDto.main_skill} and proficiency level ${createUserSkillRatingDto.level} is successfully created.`,
    };
  }

  async findAll(cci_id: string): Promise<AllUserSkillRatingDto[]> {
    // 1. Check if there are any records for this user
    const skillRatings = await this.userRatingRepository.find({
      where: { cci_id },
      relations: ['mainSkill', 'level'],
      order: { updatedAt: 'DESC' },
    });

    if (skillRatings.length === 0) {
      throw new NotFoundException(
        `No skill ratings found for CCI ID: ${cci_id}`,
      );
    }

    // 2. Return formatted DTOs
    return skillRatings.map((rating) => ({
      cci_id: rating.cci_id,
      main_skill: rating.mainSkill?.mainSkill || '',
      level: rating.level?.level || '',
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} userSkillRating`;
  }

  async update(updateUserSkillRatingDto: UpdateUserSkillRatingDto) {
    // 1. check if the user with this cci id exist
    const user = await this.userRepository.findOne({
      where: { cci_id: updateUserSkillRatingDto.cci_id },
    });
    if (!user)
      throw new NotFoundException(
        `User with cci id ${updateUserSkillRatingDto.cci_id} does not exists.`,
      );

    // 2. check if the mainSkill with this id exist
    const mainSkill = await this.mainSkillRepository.findOne({
      where: { mainSkill: updateUserSkillRatingDto.main_skill },
    });
    if (!mainSkill)
      throw new NotFoundException(
        `${updateUserSkillRatingDto.main_skill} main skill does not exists.`,
      );

    // 3. check if the level with this id exist
    const level = await this.levelRepository.findOne({
      where: { level: updateUserSkillRatingDto.level },
    });
    if (!level)
      throw new NotFoundException(
        `${updateUserSkillRatingDto.level} level does not exists.`,
      );
    // 4. check if a record with these details exist

    let rating = await this.userRatingRepository.findOne({
      where: {
        cci_id: updateUserSkillRatingDto.cci_id,
        mainSkill: mainSkill,
      },
    });

    if (!rating)
      throw new NotFoundException(`Record not found, please create a new one.`);

    // 5. create a new record
    try {
      rating.level = level; // assign the new level value
      this.userRatingRepository.save(rating);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update the record. ',
        error,
      );
    }

    return {
      message: `User skill rating record for user ${updateUserSkillRatingDto.cci_id}, main skill ${updateUserSkillRatingDto.main_skill} and new proficiency level ${updateUserSkillRatingDto.level} is successfully updated.`,
    };
  }

  remove(id: number) {
    return `This action removes a #${id} userSkillRating`;
  }

  async fetchUserCountPerSkill() {
    try {
      const result = await this.mainSkillRepository
        .createQueryBuilder('mainSkill')
        .leftJoin('mainSkill.userSkillRatings', 'userSkillRating')
        .select('mainSkill.mainSkill', 'mainSkill')
        .addSelect('COUNT(DISTINCT userSkillRating.cci_id)', 'user_count')
        .groupBy('mainSkill.id')
        .getRawMany();

      if (result.length === 0) {
        throw new Error('No skill ratings found');
      }

      return result;
    } catch (error) {
      console.error('Error fetching skill user count:', error);
      throw error;
    }
  }
}
