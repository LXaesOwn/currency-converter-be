import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();


const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  EXCHANGE_RATE_API_URL: z.string().url(),
  EXCHANGE_RATE_API_KEY: z.string().optional(),
});


const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('❌ Invalid environment variables:', env.error.format());
  process.exit(1);
}

export const config = {
  port: parseInt(env.data.PORT, 10),
  nodeEnv: env.data.NODE_ENV,
  supabase: {
    url: env.data.SUPABASE_URL,
    anonKey: env.data.SUPABASE_ANON_KEY,
  },
  exchangeApi: {
    url: env.data.EXCHANGE_RATE_API_URL,
    key: env.data.EXCHANGE_RATE_API_KEY,
  },
} as const;

export type Config = typeof config;