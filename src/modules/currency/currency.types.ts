import { z } from 'zod';
export const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'RUB', 'CNY'
] as const;
export type Currency = typeof SUPPORTED_CURRENCIES[number];
export const CurrencyRateSchema = z.object({
  base: z.string().length(3),
  rates: z.record(z.string().length(3), z.number()),
  date: z.string()
});
export type CurrencyRate = z.infer<typeof CurrencyRateSchema>;
export const GetRatesQuerySchema = z.object({
  base: z.string().length(3).optional(),
  targets: z.string().optional()
});
export type GetRatesQuery = z.infer<typeof GetRatesQuerySchema>;