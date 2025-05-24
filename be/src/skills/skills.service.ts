import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillMatrix } from './entities/skillMatrix.entity';
import { Levels } from './entities/levels.entity';
import { Legend } from '../master/entities/legend.entity';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { CreateSkillDto } from './dto/create-skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(SkillMatrix)
    private readonly skillsRepository: Repository<SkillMatrix>,

    @InjectRepository(Levels)
    private readonly levelsRepository: Repository<Levels>,

    @InjectRepository(Legend)
    private readonly masterRepository: Repository<Legend>,
  ) {}

  async editSkillMatrix(updateSkillMatrixDto: UpdateSkillDto[]) {
    try {
      // map each skill id with the value
      const updatedSkill = await updateSkillMatrixDto.map(async (skill) => {
        
        const idExists = await this.skillsRepository.findOne({
          where: { id: skill.id },
        });

        if (!idExists) {
          throw new NotFoundException(`Skill with ID ${skill.id} not found`);
        }

        await this.skillsRepository.update(skill.id, {
          isVisible: skill.isVisible,
          orderNo: skill.orderNo,
        });
      });
      console.log(updatedSkill);

      // execute update concurrently for better performance
      await Promise.all(updatedSkill);
      return { message: 'Data successfully updated.' };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to update the skill data' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<SkillMatrix[]> {
    return this.skillsRepository.find();
  }

  async findOne(id: string): Promise<SkillMatrix | null> {
    const skill = await this.skillsRepository.findOne({ where: { id } });
    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }
    return skill;
  }

  async getById(id: string): Promise<SkillMatrix> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: ['levels', 'master'],
    });

    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }

    return skill;
  }
}
