import { supabase } from '../../config/database';
import { User, UpdateUserDto } from './user.types';

export class UserRepository {
  async findByUserId(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { 
        return null;
      }
      throw error;
    }

    return data as User;
  }

  async create(userId: string, baseCurrency: string): Promise<User> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        user_id: userId,
        base_currency: baseCurrency,
        favorites: [],
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }

  async update(userId: string, updates: UpdateUserDto): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }
}

export const userRepository = new UserRepository();