"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const user_repository_1 = require("./user.repository");
const user_types_1 = require("./user.types");
const zod_1 = require("zod");
class UserService {
    async findOrCreate(userId) {
        
        let user = await user_repository_1.userRepository.findByUserId(userId);
        
        if (!user) {
            user = await user_repository_1.userRepository.create(userId, 'USD');
        }
        return user;
    }
    async getUser(userId) {
        const user = await user_repository_1.userRepository.findByUserId(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async updateUser(userId, updates) {
        try {
            // Валидируем входные данные
            const validated = user_types_1.updateUserSchema.parse(updates);
            // Обновляем пользователя
            const updated = await user_repository_1.userRepository.update(userId, validated);
            return updated;
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                throw new Error(`Validation error: ${error.message}`);
            }
            throw error;
        }
    }
    async createUser(userId, baseCurrency) {
        return user_repository_1.userRepository.create(userId, baseCurrency);
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
