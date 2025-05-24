import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { MasterService } from './master.service';
import { CreateLegendDto } from './dto/create-legend.dto';
import { UpdateMasterDto } from './dto/update-master.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Legend } from './entities/legend.entity';

@ApiTags('Master')
@Controller('master')
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Master entry' })
  @ApiResponse({ status: 201, description: 'Created', type: Legend })
  create(@Body() createMasterDto: CreateLegendDto) {
    return this.masterService.create(createMasterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Master entries' })
  @ApiResponse({ status: 200, description: 'Success', type: [Legend] })
  findAll() {
    return this.masterService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single Master entry by ID' })
  @ApiResponse({ status: 200, description: 'Success', type: Legend })
  findOne(@Param('id') id: string) {
    return this.masterService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a Master entry by ID' })
  @ApiResponse({ status: 200, description: 'Updated', type: Legend })
  update(@Param('id') id: string, @Body() updateMasterDto: UpdateMasterDto) {
    return this.masterService.update(id, updateMasterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Master entry by ID' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  remove(@Param('id') id: string) {
    return this.masterService.remove(id);
  }
}
