import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { userService } from '../modules/user/user.service';
import { COOKIE_MAX_AGE_SECONDS } from '../config/env';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let userId = req.cookies.user_id;

    if (!userId) {
      userId = uuidv4();
      console.log(`🆕 Creating new user with ID: ${userId}`);
      // findOrCreate ВОЗВРАЩАЕТ пользователя (созданного или существующего)
      const newUser = await userService.findOrCreate(userId);
      req.user = newUser;
    } else {
      console.log(`👤 Existing user with ID: ${userId}`);
      // Если пользователь есть в куках, получаем его данные
      const existingUser = await userService.getUserById(userId);
      
      if (existingUser) {
        // Если пользователь найден в БД
        req.user = existingUser;
      } else {
        // Если пользователь не найден в БД (например, БД очистили), создаем нового
        console.log(`⚠️ User ${userId} not found in DB, creating new one`);
        const newUser = await userService.findOrCreate(userId);
        req.user = newUser;
        // Обновляем userId на новый
        userId = newUser.user_id;
      }
    }

    // Устанавливаем куку (в секундах!)
    res.cookie('user_id', userId, {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE_SECONDS * 1000, // Конвертируем в ms для express
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    next(error);
  }
};