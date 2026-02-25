"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratesQuerySchema = void 0;
const zod_1 = require("zod");
exports.ratesQuerySchema = zod_1.z.object({
    base: zod_1.z.string().length(3).optional(),
    targets: zod_1.z.string().transform((str) => str.split(',')),
});
