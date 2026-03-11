import { z } from 'zod';

export const UserSchema = z.object({
  user_id: z.string().uuid(),
  base_currency: z.string().length(3).default('USD'),
  favorites: z.array(z.string().length(3)).default([]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type User = z.infer<typeof UserSchema>;

export const UpdateUserSchema = z.object({
  baseCurrency: z.string().length(3).optional(),
  favorites: z.array(z.string().length(3)).optional()
});

export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;