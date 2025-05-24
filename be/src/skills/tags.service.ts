import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tags } from './entities/tags.entity';
import { CreateTagDto } from './dto/create-tags.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tags)
    private readonly tagsRepository: Repository<Tags>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tags> {
    const newTag = this.tagsRepository.create(createTagDto);
    return this.tagsRepository.save(newTag);
  }

  async findAll(): Promise<Tags[]> {
    return this.tagsRepository.find();
  }

  async findOne(id: string): Promise<Tags> {
    const tag = await this.tagsRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return tag;
  }
}
