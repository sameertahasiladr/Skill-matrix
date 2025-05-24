import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Tokens } from './entities/tokens.entity'; 
import { EmailService } from './utils/email.service';
import { TokenService } from './utils/token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { UserModule } from '../user/user.module';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([User, Tokens]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    UserModule,
    EmployeeModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    TokenService,
    LocalStrategy,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    UserService,
  ],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
