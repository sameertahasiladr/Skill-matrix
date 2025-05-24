import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import databaseConfig from './ormconfig';

export const typeOrmConfig: TypeOrmModuleOptions = databaseConfig;

export const databaseAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => {
    const isDev = process.env.STAGE === 'dev' ? true : false;

    return {
      type: 'mysql',
      host: configService.get('DB_HOST'),
      port: configService.get('DB_PORT'),
      username: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      database: configService.get('DB_DATABASE'),
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['dist/src/migrations/*.js'],
      // seeds: ['dist/src/seeds/**.js'],
      logging: isDev,
      synchronize: false,
    };
  },
};
