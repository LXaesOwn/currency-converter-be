import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';

export class UserController {
  /**
   * @swagger
   * /api/user:
   *   get:
   *     summary: Возвращает настройки текущего пользователя
   *     tags: [User]
   *     responses:
   *       200:
   *         description: Настройки пользователя
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user_id:
   *                   type: string
   *                 base_currency:
   *                   type: string
   *                 favorites:
   *                   type: array
   *                   items:
   *                     type: string
   *       404:
   *         description: Пользователь не найден
   */
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await userService.getUser(userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/user:
   *   post:
   *     summary: Обновляет настройки пользователя
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               base_currency:
   *                 type: string
   *                 example: EUR
   *               favorites:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ["USD", "GBP"]
   *     responses:
   *       200:
   *         description: Обновленный пользователь
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await userService.updateUser(userId, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();