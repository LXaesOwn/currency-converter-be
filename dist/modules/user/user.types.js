"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = void 0;
// Схема валидации для обновления пользователя
const zod_1 = require("zod");
exports.updateUserSchema = zod_1.z.object({
    base_currency: zod_1.z.string().length(3).optional(),
    favorites: zod_1.z.array(zod_1.z.string().length(3)).optional(),
});
