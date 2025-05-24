import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { TagSkillsService } from './tagskills.service';
import { CreateTagSkillsDto } from './dto/create-tagskills.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TagSkills } from './entities/tagskills.entity';

@ApiTags('TagSkills')
@Controller('tagskills')
export class TagSkillsController {
  constructor(private readonly tagSkillsService: TagSkillsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag-skill relationship' })
  @ApiResponse({ status: 201, description: 'Tag-skill relationship created successfully', type: TagSkills })
  create(@Body() createTagSkillsDto: CreateTagSkillsDto): Promise<TagSkills> {
    return this.tagSkillsService.create(createTagSkillsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tag-skill relationships' })
  @ApiResponse({ status: 200, description: 'List of tag-skill relationships', type: [TagSkills] })
  findAll(): Promise<TagSkills[]> {
    return this.tagSkillsService.findAll();
  }

  @Get(':skillId')
  @ApiOperation({ summary: 'Get tag-skill relationships by skill ID' })
  @ApiResponse({ status: 200, description: 'List of tag-skill relationships', type: [TagSkills] })
  findBySkill(@Param('skillId') skillId: string): Promise<TagSkills[]> {
    return this.tagSkillsService.findBySkill(skillId);
  }
}
