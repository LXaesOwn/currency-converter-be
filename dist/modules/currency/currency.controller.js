"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyController = exports.CurrencyController = void 0;
const currency_service_1 = require("./currency.service");
const user_service_1 = require("../user/user.service");
class CurrencyController {
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
    async getCurrencies(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const currencies = await currency_service_1.currencyService.getSupportedCurrencies(userId);
            res.json(currencies);
        }
        catch (error) {
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
    async getRates(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { base, targets } = req.query;
            
            if (!targets) {
                return res.status(400).json({ error: 'Targets parameter is required' });
            }
            
            const targetsString = targets;
            const targetsArray = targetsString.split(',').map(t => t.trim().toUpperCase());
            console.log('Processing rates request:', { base, targetsArray });
            if (targetsArray.length === 0) {
                return res.status(400).json({ error: 'At least one target currency is required' });
            }
            
            const user = await user_service_1.userService.getUser(userId);
            const rates = await currency_service_1.currencyService.getRates(userId, base || '', targetsArray, user.base_currency);
            res.json({
                base: base?.toUpperCase() || user.base_currency,
                rates,
            });
        }
        catch (error) {
            console.error('Controller error:', error);
            next(error);
        }
    }
}
exports.CurrencyController = CurrencyController;
exports.currencyController = new CurrencyController();
