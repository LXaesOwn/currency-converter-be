export interface User {
  user_id: string;
  base_currency: string;
  favorites: string[];
  created_at: string;
  updated_at: string;
}

export interface UpdateUserDto {
  base_currency?: string;
  favorites?: string[];
}


import { z } from 'zod';

export const updateUserSchema = z.object({
  base_currency: z.string().length(3).optional(),
  favorites: z.array(z.string().length(3)).optional(),
});