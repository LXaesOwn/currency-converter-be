import { UserRepository } from './user.repository';
import { UpdateUserRequest } from './user.types';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async findOrCreate(userId: string) {
    console.log(`🔍 Finding or creating user: ${userId}`);
    
    
    const existingUser = await this.userRepository.findById(userId);
    if (existingUser) {
      console.log(` User found: ${userId}`);
      return existingUser;
    }
    

    console.log(`🆕 Creating new user: ${userId}`);
    const newUser = await this.userRepository.create(userId);
    return newUser;
  }

  async getUserById(userId: string) {
    console.log(`🔍 Getting user by ID: ${userId}`);
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      console.log(` User not found: ${userId}`);
      return null; 
    }
    
    console.log(` User retrieved: ${userId}`);
    return user;
  }

  async updateUser(userId: string, data: UpdateUserRequest) {
    console.log(` Updating user: ${userId}`);
    const updates: any = {};
    if (data.baseCurrency) updates.base_currency = data.baseCurrency;
    if (data.favorites) updates.favorites = data.favorites;
    
    const updatedUser = await this.userRepository.update(userId, updates);
    console.log(` User updated: ${userId}`);
    return updatedUser;
  }
}
export const userService = new UserService(new UserRepository());