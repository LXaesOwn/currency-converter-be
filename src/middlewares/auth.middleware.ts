/* eslint-disable @typescript-eslint/no-namespace */
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { userService } from '../modules/user/user.service';

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
    
    let userId = req.cookies?.user_id;

    console.log('Auth middleware - userId from cookie:', userId);

    
    if (!userId) {
      userId = uuidv4();
      console.log('Creating new user with ID:', userId);

      
      await userService.createUser(userId, 'USD');

      
      res.cookie('user_id', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 365 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });
      
      console.log('Cookie set with user_id:', userId);
    }

    
    req.userId = userId;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next(error);
  }
};