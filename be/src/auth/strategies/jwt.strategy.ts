import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IPayload } from '../interfaces/payload.interface';
import { LoginUserDto } from '../dto/login-user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: IPayload) {
  
    if (!payload.cci_id) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userRepository.findOne({
      where: { cci_id: payload.cci_id },
    });
    if (!user) {
      throw new UnauthorizedException();
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
