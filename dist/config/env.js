"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");

dotenv_1.default.config();

const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('3000'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    SUPABASE_URL: zod_1.z.string().url(),
    SUPABASE_ANON_KEY: zod_1.z.string().min(1),
    EXCHANGE_RATE_API_URL: zod_1.z.string().url(),
    EXCHANGE_RATE_API_KEY: zod_1.z.string().optional(),
});

const env = envSchema.safeParse(process.env);
if (!env.success) {
    console.error('❌ Invalid environment variables:', env.error.format());
    process.exit(1);
}
exports.config = {
    port: parseInt(env.data.PORT, 10),
    nodeEnv: env.data.NODE_ENV,
    supabase: {
        url: env.data.SUPABASE_URL,
        anonKey: env.data.SUPABASE_ANON_KEY,
    },
    exchangeApi: {
        url: env.data.EXCHANGE_RATE_API_URL,
        key: env.data.EXCHANGE_RATE_API_KEY,
    },
};
