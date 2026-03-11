import { supabase } from '../../config/database';
import { User } from './user.types';

export class UserRepository {
  async findById(userId: string): Promise<User | null> {
    console.log(` Repository: Finding user by ID: ${userId}`);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    // PGRST116 means no rows found - this is expected when user doesn't exist
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`ℹ️ User not found in DB: ${userId}`);
        return null; 
      }
      console.error(`❌ Repository error:`, error);
      throw error;
    }

    console.log(` Repository: User found: ${userId}`);
    return data;
  }

  async create(userId: string): Promise<User> {
    console.log(`🆕 Repository: Creating user: ${userId}`);
    
    const { data, error } = await supabase
      .from('users')
      .insert({ 
        user_id: userId,
        base_currency: 'USD',
        favorites: [] 
      })
      .select()
      .single();

    if (error) {
      console.error(` Repository create error:`, error);
      throw error;
    }

    console.log(` Repository: User created: ${userId}`);
    return data;
  }

  async update(userId: string, updates: Partial<User>): Promise<User> {
    console.log(` Repository: Updating user: ${userId}`);
    
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error(` Repository update error:`, error);
      throw error;
    }

    console.log(` Repository: User updated: ${userId}`);
    return data;
  }
}