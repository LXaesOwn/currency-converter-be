"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const user_service_1 = require("./user.service");
class UserController {
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
    async getUser(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const user = await user_service_1.userService.getUser(userId);
            res.json(user);
        }
        catch (error) {
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
    async updateUser(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const user = await user_service_1.userService.updateUser(userId, req.body);
            res.json(user);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
