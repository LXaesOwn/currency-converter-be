"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const uuid_1 = require("uuid");
const user_service_1 = require("../modules/user/user.service");
const authMiddleware = async (req, res, next) => {
    try {
        // Пробуем получить user_id из куки
        let userId = req.cookies?.user_id;
        // Если куки нет - создаем нового пользователя
        if (!userId) {
            userId = (0, uuid_1.v4)();
            // Создаем пользователя в БД с базовой валютой USD по умолчанию
            await user_service_1.userService.createUser(userId, 'USD');
            // Устанавливаем httpOnly куку
            res.cookie('user_id', userId, {
                httpOnly: true, // Недоступна из JavaScript на клиенте
                secure: process.env.NODE_ENV === 'production', // Только по HTTPS в production
                maxAge: 365 * 24 * 60 * 60 * 1000, // Год
                sameSite: 'lax',
            });
        }
        // Добавляем userId в объект request для использования в контроллерах
        req.userId = userId;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
