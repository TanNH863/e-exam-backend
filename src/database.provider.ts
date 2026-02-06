import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const poolConfig = connectionString
  ? { connectionString }
  : {
      user: process.env.POSTGRES_USER || 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost' || 'db',
      database: process.env.POSTGRES_DB || 'eexam',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    };

export const dbProvider = {
  provide: 'PG_POOL',
  useValue: new Pool(poolConfig),
};
