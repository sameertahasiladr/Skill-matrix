import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  BadRequestException,
  Patch,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from './dto/user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from './enums/roles.enum';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
@UseGuards(RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('reset-password/sending-email')
  @UsePipes(ValidationPipe)
  @ApiOperation({
    summary:
      'Check if the user is active or inactive and if inactive, send an email',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully checked the user and action taken accordingly',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async sendResetPasswordEmail(@Body() userDto: UserDto) {
    return this.authService.validateUserStatus(userDto.cci_id);
  }

  @Get('validate-reset-token')
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Valid the provided token' })
  @ApiResponse({
    status: 200,
    description: 'Successfully validated the token',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, token not provided',
  })
  async validateResetToken(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required.');
    }
    return this.authService.validateResetToken(token);
  }

  @Patch('set-password')
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Reset the password' })
  @ApiResponse({
    status: 200,
    description: 'Successfully reset the password',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 404,
    description: 'User with provided cci id not found',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    if (!resetPasswordDto) throw HttpStatus.BAD_REQUEST;

    const msg = await this.authService.resetPassword(resetPasswordDto);
    return { message: `${msg}` };
  }

  @Post('/login')
  @UsePipes(ValidationPipe)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 404,
    description: 'User with provided cci id not found',
  })
  async userLogin(@Req() req, @Body() data: CreateAuthDto) {
    if (!data || !req) throw HttpStatus.BAD_REQUEST;

    return await this.authService.login(req.user);
  }
}
