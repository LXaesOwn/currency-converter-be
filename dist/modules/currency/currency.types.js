"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyCodeSchema = exports.ratesQuerySchema = void 0;
const zod_1 = require("zod");

exports.ratesQuerySchema = zod_1.z.object({
    base: zod_1.z.string().length(3).optional(),
    targets: zod_1.z.string().transform((str) => {
        
        return str.split(',').map(s => s.trim().toUpperCase());
    }),
});

exports.currencyCodeSchema = zod_1.z.string().length(3).regex(/^[A-Z]{3}$/);
