import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();
const envSchema = z.object({
  PORT: z.string().default('3000'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  EXCHANGE_RATE_API_URL: z.string().url(),
  EXCHANGE_RATE_API_KEY: z.string().optional(),
  CACHE_IN_MEMORY_SECONDS: z.string().default('300'),
  CACHE_DB_HOURS: z.string().default('24'),
  COOKIE_AGE_DAYS: z.string().default('30')
});
const env = envSchema.parse(process.env);
export const PORT = parseInt(env.PORT, 10);
export const SUPABASE_URL = env.SUPABASE_URL;
export const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;
export const EXCHANGE_RATE_API_URL = env.EXCHANGE_RATE_API_URL;
export const EXCHANGE_RATE_API_KEY = env.EXCHANGE_RATE_API_KEY;
export const CACHE_IN_MEMORY_TTL = parseInt(env.CACHE_IN_MEMORY_SECONDS, 10);
export const CACHE_DB_TTL_HOURS = parseInt(env.CACHE_DB_HOURS, 10);
export const COOKIE_MAX_AGE_SECONDS = parseInt(env.COOKIE_AGE_DAYS, 10) * 86400;
export const CACHE_KEYS = {
  RATES: 'rates',
  CURRENCIES: 'currencies',
  USER: 'user'
} as const;