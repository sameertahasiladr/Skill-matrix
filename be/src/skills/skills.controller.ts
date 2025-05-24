import {
  Controller,
  Patch,
  Body,
  Get,
  Param,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SkillMatrix } from './entities/skillMatrix.entity';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role as RoleEnum } from '../auth/enums/roles.enum';

@ApiTags('Skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  // edit skill matrix endpoint
  @Roles(RoleEnum.Admin)
  @UseGuards(RolesGuard)
  @Patch('update')
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Update order no. and visibility values of skill' })
  @ApiResponse({
    status: 201,
    description: 'Successfully updated',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiBody({
    description: 'Update Skill Matrix',
    type: UpdateSkillDto,
    isArray: true,
  })
  async editSkillMatrix(
    @Body()
    updateSkillMatrix: UpdateSkillDto[],
  ) {
    if (
      !updateSkillMatrix ||
      updateSkillMatrix.length == 0 // if no data is passed
    )
      throw new HttpException(
        { message: `No skill matrix value is passed.` },
        HttpStatus.BAD_REQUEST,
      );
    return await this.skillsService.editSkillMatrix(updateSkillMatrix);
  }

  // @Post()
  // @ApiOperation({ summary: 'Create a new skill' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Skill created successfully',
  //   type: SkillMatrix,
  // })
  // create(@Body() createSkillDto: CreateSkillDto): Promise<SkillMatrix> {
  //   return this.skillsService.create(createSkillDto);
  // }

  @Get()
  @ApiOperation({ summary: 'Get all skills' })
  @ApiResponse({
    status: 200,
    description: 'List of skills',
    type: [SkillMatrix],
  })
  findAll(): Promise<SkillMatrix[]> {
    return this.skillsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific skill by ID' })
  @ApiResponse({
    status: 200,
    description: 'The skill data',
    type: SkillMatrix,
  })
  findOne(@Param('id') id: string): Promise<SkillMatrix | null> {
    return this.skillsService.findOne(id);
  }
}
