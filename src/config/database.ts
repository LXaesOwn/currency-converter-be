import { createClient } from '@supabase/supabase-js';
import { config } from './env';


export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);


export type Tables = {
  users: {
    user_id: string;
    base_currency: string;
    favorites: string[];
    created_at: string;
    updated_at: string;
  };
  exchange_rates_cache: {
    cache_key: string;
    rates: Record<string, number>;
    base_currency: string;
    created_at: string;
    updated_at: string;
  };
};