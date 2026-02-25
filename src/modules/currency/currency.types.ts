export interface ExchangeRateResponse {
  base: string;
  rates: Record<string, number>;
  date?: string;
}

export interface CachedRates {
  cache_key: string;
  rates: Record<string, number>;
  base_currency: string;
  updated_at: string;
}

import { z } from 'zod';

export const ratesQuerySchema = z.object({
  base: z.string().length(3).optional(),
  targets: z.string().transform((str) => str.split(',')),
});