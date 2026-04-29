import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

// Next.js 约定: .env.local 覆盖 .env;脚本要自己加载
config({ path: '.env.local' });
config({ path: '.env' });

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
