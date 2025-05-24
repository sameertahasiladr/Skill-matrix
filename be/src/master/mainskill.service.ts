import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MainSkill } from './entities/mainskill.entity';
import { CreateMainSkillDto } from './dto/create-mainskill.dto';

@Injectable()
export class MainSkillService {
  constructor(
    @InjectRepository(MainSkill)
    private readonly mainSkillRepository: Repository<MainSkill>,
  ) {}

  async create(createMainSkillDto: CreateMainSkillDto): Promise<MainSkill> {
    const mainSkill = this.mainSkillRepository.create(createMainSkillDto);
    return await this.mainSkillRepository.save(mainSkill);
  }

  async findAll(): Promise<MainSkill[]> {
    return await this.mainSkillRepository.find();
  }
  async findByName(name: string): Promise<MainSkill | null> {
    return await this.mainSkillRepository.findOne({ where: { mainSkill: name } });
  }
  
  async getTotalMainSkills(): Promise<number> {
    return await this.mainSkillRepository.count();
  }
}
