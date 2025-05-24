import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  BadRequestException,
  Logger,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { EmailService } from './utils/email.service';
import { Tokens } from './entities/tokens.entity';
import { TokenService } from './utils/token.service';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tokens)
    private readonly tokenRepository: Repository<Tokens>,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    @Inject() private readonly userService: UserService,
  ) {}

  private readonly saltOrRounds = 10;

  // check if the user active or inactive
  async validateUserStatus(cci_id: string) {
    const user = await this.userService.findByCCIid(cci_id);

    if (!user) {
      throw new NotFoundException(
        `User with this CCI ID: ${cci_id} does not exist.`,
      );
    }
    
    if (user.cci_id !== cci_id) {
      throw new BadRequestException(
        `Invalid CCI ID`,
      );
    }

    // Ensure signup_status is always processed in lowercase
    const signupStatus = user.signup_status.toLowerCase();

    if (
      signupStatus === 'active' ||
      (user.role === 'admin' && user.signup_status === 'active')
    ) {
      return { cci_id: user.cci_id };
    }

    if (user.role === 'admin' && user.signup_status !== 'active') {
      throw new BadRequestException(
        'Admin account is inactive. You are not allowed to log in.',
      );
    }
    return await this.sendResetPasswordEmail(cci_id, user);
  }

  // send an email since the user is inactive
  async sendResetPasswordEmail(cci_id: string, user: User) {
    // Generate a new token (always unique)
    const resetToken = this.tokenService.generateResetToken(cci_id);

    //  Store the token (previous one will be deleted)
    await this.tokenService.storeResetToken(cci_id, resetToken);

    // Build the reset URL using FRONTEND_URL from env
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetUrl = `${frontendUrl}?token=${resetToken}`;

    const fullName = `${user.firstName} ${user.lastName}`;

    // Step 6: Send email with reset link and user's full name
    await this.emailService.sendResetPasswordEmail(
      user.emp_email,
      fullName,
      resetUrl,
    );

    return { message: 'Password reset email sent successfully.' };
  }

  async validateResetToken(token: string) {
    // Step 1: Verify token
    const decoded = this.tokenService.verifyResetToken(token);

    if (!decoded || !decoded.cci_id) {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    // Step 2: Check if the token exists in the database
    const storedToken = await this.tokenRepository.findOne({
      where: { token, cci_id: decoded.cci_id },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    return { cci_id: decoded.cci_id };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // 1. validate confirmPwd & pwd
    if (resetPasswordDto.password === resetPasswordDto.confirm_password) {
      // 2. check if user with cci_id exists
      const user = await this.userService.findByCCIid(resetPasswordDto.cci_id);

      if (user) {
        // 3. hash the password
        const hashPwd = await bcrypt.hash(
          resetPasswordDto.password,
          this.saltOrRounds,
        );

        // 4. update & save the password of the user with cci_id
        user.password = hashPwd;

        // 5. if signup_status is inactive, make active
        const signupStatus = user.signup_status.toLowerCase();
        if (signupStatus == 'inactive') {
          // set the status as active
          user.signup_status = 'Active';
        }
        this.userRepository.save(user);

        // 6. send appropriate message
        Logger.log(`Password reset successfully.`);
        return `Password for User ${resetPasswordDto.cci_id} reset successfully.`;
      } else {
        throw new HttpException(
          {
            message: `User with CCI ID ${resetPasswordDto.cci_id} doesn't exist`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
    } else {
      throw new HttpException(
        { message: 'Passwords do not match.' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async login(loginDto: LoginUserDto) {
    try {
      const user = await this.userService.findByCCIid(loginDto.cci_id);
      if (!user)
        throw new NotFoundException(`User ${loginDto.cci_id} is not found`);

      const payload = { cci_id: loginDto.cci_id, role: user.role };

      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '6hr',
      });

      // modify the signup_status of the user if inactive
      const signupStatus = user.signup_status.toLowerCase();
      if (signupStatus === 'inactive') {
        user.signup_status = 'Active';
        this.userRepository.save(user);
      }

      return {
        access_token: token,
        firstName: loginDto.firstName,
        lastName: loginDto.lastName,
        cci_id: loginDto.cci_id,
        role: loginDto.role,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to login the user', error)
    }
  }

  async validateUser(authDto: CreateAuthDto) {
    // check if user with this dto exist
    const user = await this.userService.findByCCIid(authDto.cci_id);
    if (!user) return null;

    const isMatch = await bcrypt.compare(authDto.password, user.password);

    if (user && isMatch) {
      const loginDto: LoginUserDto = {
        firstName: user.firstName,
        lastName: user.lastName,
        cci_id: user.cci_id,
        role: user.role,
      };

      return loginDto;
    }

    return null;
  }
}
