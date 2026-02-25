"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const auth_middleware_1 = require("./middlewares/auth.middleware");
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const currency_routes_1 = __importDefault(require("./modules/currency/currency.routes"));
const env_1 = require("./config/env");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: true,
    credentials: true, // Важно для кук
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)()); // Для парсинга кук
app.use(auth_middleware_1.authMiddleware); // Наш middleware для user_id
// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Currency Converter API',
            version: '1.0.0',
            description: 'API for currency conversion with user preferences',
        },
        servers: [
            {
                url: `http://localhost:${env_1.config.port}`,
                description: 'Development server',
            },
        ],
    },
    apis: ['./src/modules/**/*.controller.ts'], // Где искать JSDoc комментарии
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// Routes
app.use('/api/user', user_routes_1.default);
app.use('/api', currency_routes_1.default);
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error('Error:', err.message);
    if (err.message.includes('Validation')) {
        return res.status(400).json({ error: err.message });
    }
    if (err.message.includes('not found')) {
        return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
});
exports.default = app;
