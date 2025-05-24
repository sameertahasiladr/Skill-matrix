import { DataSourceOptions } from 'typeorm';
import * as dotEnv from 'dotenv';
import { ENV_FILE_PATH } from 'src/core/constant/env.constant';
import { SeederOptions } from 'typeorm-extension';

dotEnv.config({ path: ENV_FILE_PATH });

const ormConfig: DataSourceOptions & SeederOptions = {
  type: 'mysql',
  host: process.env.DB_HOST ?? '',
  port: parseInt(process.env.DB_PORT ?? '3306'),
  username: process.env.DB_USERNAME ?? '',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? '',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  seeds: [__dirname + '/../seeds/*{.ts,.js}'],
  synchronize: false,
  logging: true,
  migrationsRun: true,
};
export default ormConfig;
