"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const database_1 = require("../../config/database");
class UserRepository {
    async findByUserId(userId) {
        const { data, error } = await database_1.supabase
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
        return data;
    }
    async create(userId, baseCurrency) {
        const now = new Date().toISOString();
        const { data, error } = await database_1.supabase
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
        if (error)
            throw error;
        return data;
    }
    async update(userId, updates) {
        const { data, error } = await database_1.supabase
            .from('users')
            .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
            .eq('user_id', userId)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
