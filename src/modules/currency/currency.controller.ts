import { Request, Response, NextFunction } from 'express';
import { currencyService } from './currency.service'; 
import { GetRatesQuerySchema } from './currency.types';

export class CurrencyController {
  async getCurrencies(req: Request, res: Response, next: NextFunction) {
    try {
      const currencies = await currencyService.getSupportedCurrencies();
      res.json(currencies);
    } catch (error) {
      next(error);
    }
  }

  async getRates(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const query = GetRatesQuerySchema.parse(req.query);
      const base = query.base || req.user.base_currency;
      const targets = query.targets ? query.targets.split(',') : [];

      const rates = await currencyService.getRates(req.user.user_id, base, targets);
      res.json({ base, rates });
    } catch (error) {
      next(error);
    }
  }
}
export const currencyController = new CurrencyController();