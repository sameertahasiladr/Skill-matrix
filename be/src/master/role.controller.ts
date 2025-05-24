import { Controller, Post, Get, Body } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Role } from './entities/role.entity';

@ApiTags('Role') 
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Role' })
  @ApiResponse({ status: 201, description: 'Created', type: Role })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Roles' })
  @ApiResponse({ status: 200, description: 'Success', type: [Role] })
  findAll() {
    return this.roleService.findAll();
  }
}
