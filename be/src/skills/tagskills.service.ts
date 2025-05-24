import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagSkills } from './entities/tagskills.entity';
import { SkillMatrix } from './entities/skillMatrix.entity';
import { Tags } from './entities/tags.entity';
import { CreateTagSkillsDto } from './dto/create-tagskills.dto';

@Injectable()
export class TagSkillsService {
  constructor(
    @InjectRepository(TagSkills)
    private readonly tagSkillsRepository: Repository<TagSkills>,

    @InjectRepository(SkillMatrix)
    private readonly skillsRepository: Repository<SkillMatrix>,

    @InjectRepository(Tags)
    private readonly tagsRepository: Repository<Tags>,
  ) {}

  async create(createTagSkillsDto: CreateTagSkillsDto): Promise<TagSkills> {
    const skill = await this.skillsRepository.findOne({
      where: { id: createTagSkillsDto.skills_id },
    });
    if (!skill) {
      throw new NotFoundException(
        `Skill with ID ${createTagSkillsDto.skills_id} not found`,
      );
    }

    const tag = await this.tagsRepository.findOne({
      where: { id: createTagSkillsDto.tags_id },
    });
    if (!tag) {
      throw new NotFoundException(
        `Tag with ID ${createTagSkillsDto.tags_id} not found`,
      );
    }

    const newTagSkill = this.tagSkillsRepository.create({
      skills: skill,
      tags: tag,
    });
    return this.tagSkillsRepository.save(newTagSkill);
  }

  async findAll(): Promise<TagSkills[]> {
    return this.tagSkillsRepository.find({ relations: ['skills', 'tags'] });
  }

  async findBySkill(skillId: string): Promise<TagSkills[]> {
    return this.tagSkillsRepository.find({
      where: { skills: { id: skillId } },
      relations: ['tags'],
    });
  }
}
