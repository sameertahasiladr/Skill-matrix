import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseAsyncConfig } from './config/database-config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EmployeeModule } from './employee/employee.module';
import { MasterModule } from './master/master.module';
import { SkillsModule } from './skills/skills.module';
import { PdfGeneratorModule } from './pdf-generator/pdf-generator.module';
import { ExcelModule } from './excel/excel.module';
import { JobModule } from './job/job.module';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { SkillMatrixTokenModule } from './skill-matrix-token/skill-matrix-token.module';
import { UserSkillRatingModule } from './user-skill-rating/user-skill-rating.module';
import { RoadmapsModule } from './roadmaps/roadmaps.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env`],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync(databaseAsyncConfig),
    MulterModule.register({ storage: multer.memoryStorage() }),
    UserModule,
    AuthModule,
    EmployeeModule,
    MasterModule,
    SkillsModule,
    PdfGeneratorModule,
    ExcelModule,
    JobModule,
    SkillMatrixTokenModule,
    UserSkillRatingModule,
    RoadmapsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      // make JWT auth guard a global guard
      // done to ensure that Auth guard is executed before role guard
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}