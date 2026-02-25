import { Router } from 'express';
import { currencyController } from './currency.controller';

const router = Router();

router.get('/currencies', currencyController.getCurrencies.bind(currencyController));
router.get('/rates', currencyController.getRates.bind(currencyController));

export default router;