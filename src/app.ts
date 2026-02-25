import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { authMiddleware } from './middlewares/auth.middleware';
import userRoutes from './modules/user/user.routes';
import currencyRoutes from './modules/currency/currency.routes';
import { config } from './config/env';

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true, // Важно для кук
}));
app.use(express.json());
app.use(cookieParser()); // Для парсинга кук
app.use(authMiddleware); // Наш middleware для user_id

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
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/modules/**/*.controller.ts'], // Где искать JSDoc комментарии
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/user', userRoutes);
app.use('/api', currencyRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err.message);
  
  if (err.message.includes('Validation')) {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.message.includes('not found')) {
    return res.status(404).json({ error: err.message });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

export default app;