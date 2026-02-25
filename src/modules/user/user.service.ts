import { userRepository } from './user.repository';
import { User, UpdateUserDto, updateUserSchema } from './user.types';
import { ZodError } from 'zod';

export class UserService {
  async findOrCreate(userId: string): Promise<User> {
    // Пытаемся найти пользователя
    let user = await userRepository.findByUserId(userId);
    
    // Если не нашли - создаем с валютой по умолчанию
    if (!user) {
      user = await userRepository.create(userId, 'USD');
    }
    
    return user;
  }

  async getUser(userId: string): Promise<User> {
    const user = await userRepository.findByUserId(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUser(userId: string, updates: UpdateUserDto): Promise<User> {
    try {
      // Валидируем входные данные
      const validated = updateUserSchema.parse(updates);
      
      // Обновляем пользователя
      const updated = await userRepository.update(userId, validated);
      return updated;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation error: ${error.message}`);
      }
      throw error;
    }
  }

  async createUser(userId: string, baseCurrency: string): Promise<User> {
    return userRepository.create(userId, baseCurrency);
  }
}

export const userService = new UserService();