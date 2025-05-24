import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tokens } from '../entities/tokens.entity';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Tokens)
    private readonly tokenRepository: Repository<Tokens>,
  ) {}

  // generate a unique reset token
  generateResetToken(cci_id: string): string {
    return this.jwtService.sign(
      { cci_id, timestamp: Date.now() }, 
      { expiresIn: '1h' },
    );
  }

  // verify Reset Token
  verifyResetToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Expired or invalid token');
    }
  }

  // store Reset Token in Database (Delete old one first)
  async storeResetToken(cci_id: string, token: string): Promise<void> {
    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + 1); // Token valid for 1 hour

    // delete any existing token for this user before storing a new one
    await this.tokenRepository.delete({ cci_id });

    // store the new token
    await this.tokenRepository.save({ cci_id, token, expires_at });
  }
}
