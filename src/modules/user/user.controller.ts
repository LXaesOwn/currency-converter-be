import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { UpdateUserSchema } from './user.types';

export class UserController {
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }
      res.json(req.user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const validatedData = UpdateUserSchema.parse(req.body);
      const updatedUser = await userService.updateUser(req.user.user_id, validatedData);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();