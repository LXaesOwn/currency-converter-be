import { Request, Response, NextFunction } from 'express';
import { currencyService } from './currency.service';
import { userService } from '../user/user.service';

export class CurrencyController {
  /**
   * @swagger
   * /api/currencies:
   *   get:
   *     summary: Возвращает список поддерживаемых валют
   *     tags: [Currencies]
   *     responses:
   *       200:
   *         description: Список валют
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: string
   *                 example: USD
   */
  async getCurrencies(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const currencies = await currencyService.getSupportedCurrencies(userId);
      res.json(currencies);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/rates:
   *   get:
   *     summary: Возвращает курсы валют
   *     tags: [Currencies]
   *     parameters:
   *       - in: query
   *         name: base
   *         schema:
   *           type: string
   *         description: Базовая валюта (опционально)
   *       - in: query
   *         name: targets
   *         required: true
   *         schema:
   *           type: string
   *         description: Целевые валюты через запятую
   *         example: EUR,GBP,JPY
   *     responses:
   *       200:
   *         description: Курсы валют
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 base:
   *                   type: string
   *                 rates:
   *                   type: object
   *                   additionalProperties:
   *                     type: number
   */
  async getRates(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { base, targets } = req.query;
      
      // Парсим targets из строки "EUR,GBP" в массив
      const targetsArray = typeof targets === 'string' 
        ? targets.split(',').map(t => t.trim().toUpperCase())
        : [];

      if (targetsArray.length === 0) {
        return res.status(400).json({ error: 'Targets parameter is required' });
      }

      // Получаем пользователя, чтобы узнать его базовую валюту
      const user = await userService.getUser(userId);
      
      const rates = await currencyService.getRates(
        userId,
        typeof base === 'string' ? base.toUpperCase() : '',
        targetsArray,
        user.base_currency
      );

      res.json({
        base: (typeof base === 'string' ? base.toUpperCase() : user.base_currency),
        rates,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const currencyController = new CurrencyController();