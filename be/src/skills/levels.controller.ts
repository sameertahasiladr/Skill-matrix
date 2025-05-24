import { Controller, Post, Get, Body } from '@nestjs/common';
import { LevelService } from './levels.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Levels } from './entities/levels.entity';

@ApiTags('Level')
@Controller('levels')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  // @Post()
  // @ApiOperation({ summary: 'Create a new skill level' })
  // @ApiResponse({ status: 201, description: 'Skill level created successfully', type: Levels })
  // create(@Body() createLevelDto: CreateLevelDto): Promise<Levels> {
  //   return this.levelService.create(createLevelDto);
  // }

  // @Get()
  // @ApiOperation({ summary: 'Get all skill levels' })
  // @ApiResponse({ status: 200, description: 'List of skill levels', type: [Levels] })
  // findAll(): Promise<Levels[]> {
  //   return this.levelService.findAll();
  // }
}
