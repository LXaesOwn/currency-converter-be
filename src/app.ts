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


const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
};


app.use(cors(corsOptions));


app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);


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
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'user_id',
        },
      },
    },
  },
  apis: ['./src/modules/**/*.controller.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use('/api/user', userRoutes);
app.use('/api', currencyRoutes);


app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


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