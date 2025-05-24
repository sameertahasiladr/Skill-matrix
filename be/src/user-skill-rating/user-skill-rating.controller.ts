import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserSkillRatingService } from './user-skill-rating.service';
import { CreateUserSkillRatingDto } from './dto/create-user-skill-rating.dto';
import { UpdateUserSkillRatingDto } from './dto/update-user-skill-rating.dto';
import { AllUserSkillRatingDto } from './dto/all-user-skill-rating.dto';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('user-skill-rating')
@ApiTags('User Skill Rating')
export class UserSkillRatingController {
  constructor(
    private readonly userSkillRatingService: UserSkillRatingService,
  ) {}

  @Post()
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Create a new user skill rating record' })
  @ApiResponse({
    status: 201,
    description: 'Record created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Record already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to create the record',
  })
  create(@Body() createUserSkillRatingDto: CreateUserSkillRatingDto) {
    return this.userSkillRatingService.create(createUserSkillRatingDto);
  }

  @Get('/fetch-user-skills/:cci_id')
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Get all skill ratings for a user by CCI ID' })
  @ApiParam({ name: 'cci_id', description: 'CCI ID of the user' })
  @ApiResponse({
    status: 200,
    description: 'All skill ratings for the user',
    type: [AllUserSkillRatingDto],
  })
  async findAll(
    @Param('cci_id') cci_id: string,
  ): Promise<AllUserSkillRatingDto[]> {
    return this.userSkillRatingService.findAll(cci_id);
  }

  @Get('by-id/:id')
  findOne(@Param('id') id: string) {
    return this.userSkillRatingService.findOne(+id);
  }

  @Patch()
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Create a new user skill rating record' })
  @ApiResponse({
    status: 200,
    description: 'Record updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to update the record',
  })
  update(@Body() updateUserSkillRatingDto: UpdateUserSkillRatingDto) {
    return this.userSkillRatingService.update(updateUserSkillRatingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userSkillRatingService.remove(+id);
  }

  @Get('skill-user-count')
  @ApiOperation({ summary: 'Count users per main skill' })
  @ApiResponse({
    status: 200,
    description: 'Data fetched successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found',
  })
  async userCountPerSkill() {
    return await this.userSkillRatingService.fetchUserCountPerSkill();
  }
}
