import { Controller, Post, Get, Body } from '@nestjs/common';
import { DesignationService } from './designation.service';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Designation } from './entities/designation.entity';

@ApiTags('Designation') 
@Controller('designation')
export class DesignationController {
  constructor(private readonly designationService: DesignationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Designation' })
  @ApiResponse({ status: 201, description: 'Created', type: Designation })
  create(@Body() createDesignationDto: CreateDesignationDto) {
    return this.designationService.create(createDesignationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Designations' })
  @ApiResponse({ status: 200, description: 'Success', type: [Designation] })
  findAll() {
    return this.designationService.findAll();
  }
}
