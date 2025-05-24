import { Controller, Post, Get, Body } from '@nestjs/common';
import { MainSkillService } from './mainskill.service';
import { CreateMainSkillDto } from './dto/create-mainskill.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MainSkill } from './entities/mainskill.entity';
import { Query } from '@nestjs/common';


@ApiTags('MainSkill')
@Controller('mainskill')
export class MainSkillController {
  constructor(private readonly mainSkillService: MainSkillService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Main Skill' })
  @ApiResponse({ status: 201, description: 'Created', type: MainSkill })
  create(@Body() createMainSkillDto: CreateMainSkillDto) {
    return this.mainSkillService.create(createMainSkillDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Main Skills' })
  @ApiResponse({ status: 200, description: 'Success', type: [MainSkill] })
  findAll() {
    return this.mainSkillService.findAll();
  }

  @Get('fetch')
  @ApiOperation({ summary: 'Fetch Main Skill by Name' })
  @ApiResponse({ status: 200, description: 'Success', type: MainSkill })
  async fetchMainSkillByName(@Query('name') name: string) {
    const result = await this.mainSkillService.findByName(name);
    return result || { message: 'Main Skill not found' };
  }

  @Get('total')
  @ApiOperation({ summary: 'Get total number of Main Skills' })
  @ApiResponse({ status: 200, description: 'Total count of Main Skills', type: Object })
  async getTotalMainSkills() {
    const total = await this.mainSkillService.getTotalMainSkills();
    return { total };
  }
}
