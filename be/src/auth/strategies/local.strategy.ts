import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-local';
import { LoginUserDto } from '../dto/login-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    super({
      secretOrKey: jwtSecret,
      usernameField: 'cci_id',
      passwordField: 'password',
    });
  }

  async validate(cci_id: string, password: string): Promise<any> {
    const user = await this.authService.validateUser({ cci_id, password });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials in local strategy');
    }

    // attach login dto to request body
    const loginDto: LoginUserDto = {
      firstName: user.firstName,
      lastName: user.lastName,
      cci_id: user.cci_id,
      role: user.role,
    };

    return loginDto;
  }
}
