import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Next.js runtime 自动加载 .env.local。脚本场景 (tsx scripts/...) 显式加载兜底。
if (!process.env.DATABASE_URL) {
  // dynamic require 避开 next 生产打包对 dotenv 的依赖
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dotenv = require('dotenv');
    dotenv.config({ path: '.env.local' });
    dotenv.config({ path: '.env' });
  } catch {
    /* dotenv 不存在 (生产) — Next 已注入 env */
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not set');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
