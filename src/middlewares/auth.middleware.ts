import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { userService } from '../modules/user/user.service';

// Расширяем тип Request, чтобы добавить user
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Пробуем получить user_id из куки
    let userId = req.cookies?.user_id;

    // Если куки нет - создаем нового пользователя
    if (!userId) {
      userId = uuidv4();
      
      // Создаем пользователя в БД с базовой валютой USD по умолчанию
      await userService.createUser(userId, 'USD');
      
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
  } catch (error) {
    next(error);
  }
};