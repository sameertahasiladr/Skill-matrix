import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserServiceInterface } from './user.service.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { IGetUser } from 'src/auth/interfaces/get-user.interface';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserEmployeeDto } from './dto/create-user -employee.dto';
import { NEED_ID_MSG } from 'src/core/constant/constants';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role as RoleEnum } from '../auth/enums/roles.enum';
import { UserDto } from '../auth/dto/user.dto';
import { ForbiddenException } from '@nestjs/common';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    @Inject('UserServiceInterface')
    private readonly usersService: UserServiceInterface,
  ) {}

  @Get('/find-user')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.User)
  @UsePipes(ValidationPipe)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user by CCI id' })
  @ApiResponse({ status: 200, description: 'Returns user details' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findByCCIid(@Body() userDto: UserDto): Promise<User | null> {
    return this.usersService.findByCCIid(userDto.cci_id);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns user details', type: User })
  async findOne(@GetUser() user: IGetUser): Promise<User> {
    return this.usersService.findOne(user.cci_id);
  }

  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the currently authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  async updateUser(
    @GetUser() user: IGetUser,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(user.cci_id, updateUserDto);
  }

  @Delete(':cci_id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user by CCI ID' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: String,
  })
  async deleteUser(@Param('cci_id') cci_id: string): Promise<string> {
    if (!cci_id) {
      throw new BadRequestException(NEED_ID_MSG);
    }
    return this.usersService.deleteUser(cci_id);
  }

  @Post('create-user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Admin user' })
  @ApiResponse({ status: 201, description: 'Admin user created successfully' })
  async createUserAndEmployee(@Body() createUserDto: CreateUserEmployeeDto) {
    return this.usersService.createUserWithEmployee(createUserDto);
  }

  @Get('total')
@ApiOperation({ summary: 'Get total number of users' })
@ApiResponse({ status: 200, description: 'Returns total user count', type: Number })
async getTotalUsers(): Promise<{ total: number }> {
  const total = await this.usersService.getTotalUsers();
  return { total };
}

}
