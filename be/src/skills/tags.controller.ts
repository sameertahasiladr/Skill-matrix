import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tags.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Tags } from './entities/tags.entity';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag created successfully', type: Tags })
  create(@Body() createTagDto: CreateTagDto): Promise<Tags> {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: 200, description: 'List of tags', type: [Tags] })
  findAll(): Promise<Tags[]> {
    return this.tagsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific tag by ID' })
  @ApiResponse({ status: 200, description: 'The tag data', type: Tags })
  findOne(@Param('id') id: string): Promise<Tags> {
    return this.tagsService.findOne(id);
  }
}
