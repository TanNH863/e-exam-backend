import { defineConfig } from 'prisma/config';
import dotenv from "dotenv";

dotenv.config(); 

export default defineConfig({
  schema: "./src/prisma/schema.prisma",
  migrations: {
    seed: 'bun run src/prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
