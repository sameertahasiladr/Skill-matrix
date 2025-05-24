import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Levels } from './entities/levels.entity';
import { CreateLevelDto } from './dto/create-level.dto';

@Injectable()
export class LevelService {
  constructor(
    @InjectRepository(Levels)
    private readonly levelRepository: Repository<Levels>,
  ) {}

  async create(createLevelDto: CreateLevelDto): Promise<Levels> {
    const level = this.levelRepository.create(createLevelDto);
    return this.levelRepository.save(level);
  }

  async findAll(): Promise<Levels[]> {
    return this.levelRepository.find();
  }
}
