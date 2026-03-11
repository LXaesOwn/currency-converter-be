import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import fs from 'fs';

import { authMiddleware } from './middlewares/auth.middleware';
import currencyRoutes from './modules/currency/currency.routes';
import userRoutes from './modules/user/user.routes';

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : true,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);

app.get('/', (req, res) => {
  res.json({
    message: 'Currency Converter API',
    documentation: 'http://localhost:3000/api-docs',
    endpoints: {
      currencies: 'GET /api/currencies',
      rates: 'GET /api/rates?targets=EUR,GBP',
      user: 'GET /api/user',
      updateUser: 'POST /api/user'
    }
  });
});


app.use('/api', currencyRoutes);
app.use('/api/user', userRoutes);


let swaggerDocument;
const possiblePaths = [
  path.join(__dirname, './swagger/swagger.yaml'),                    
  path.join(__dirname, '../src/swagger/swagger.yaml'),               
  path.join(process.cwd(), 'src/swagger/swagger.yaml'),              
  path.join(process.cwd(), 'dist/swagger/swagger.yaml'),             
  path.join(__dirname, '../../src/swagger/swagger.yaml'),            
];

for (const swaggerPath of possiblePaths) {
  if (fs.existsSync(swaggerPath)) {
    console.log(`📚 Found swagger at: ${swaggerPath}`);
    try {
      swaggerDocument = YAML.load(swaggerPath);
      console.log(' Swagger loaded successfully');
      break;
    } catch (err) {
      if (err instanceof Error) {
        console.warn(` Failed to load swagger from ${swaggerPath}:`, err.message);
      } else {
        console.warn(` Failed to load swagger from ${swaggerPath}: Unknown error`);
      }
    }
  }
}

if (swaggerDocument) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log(' Swagger UI available at /api-docs');
} else {
  console.warn(' Swagger file not found, creating full minimal documentation');
  const minimalDoc = {
    openapi: '3.0.0',
    info: {
      title: 'Currency Converter API',
      description: 'API for currency conversion with user preferences and caching',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Local server'
      }
    ],
    tags: [
      { name: 'Currencies', description: 'Currency operations' },
      { name: 'Rates', description: 'Exchange rate operations' },
      { name: 'User', description: 'User preferences management' }
    ],
    paths: {
      '/currencies': {
        get: {
          summary: 'Get supported currencies',
          description: 'Returns a list of all supported currency codes',
          tags: ['Currencies'],
          responses: {
            '200': {
              description: 'List of supported currency codes',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'string',
                      example: 'USD'
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Server error'
            }
          }
        }
      },
      '/rates': {
        get: {
          summary: 'Get exchange rates',
          description: 'Returns current exchange rates for specified currencies',
          tags: ['Rates'],
          parameters: [
            {
              name: 'base',
              in: 'query',
              required: false,
              schema: { 
                type: 'string', 
                default: 'USD' 
              },
              description: 'Base currency (defaults to user\'s preference)'
            },
            {
              name: 'targets',
              in: 'query',
              required: false,
              schema: { 
                type: 'string' 
              },
              description: 'Comma-separated list of target currencies (e.g., EUR,GBP)'
            }
          ],
          responses: {
            '200': {
              description: 'Exchange rates',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      base: { 
                        type: 'string', 
                        example: 'USD' 
                      },
                      rates: {
                        type: 'object',
                        additionalProperties: { 
                          type: 'number' 
                        },
                        example: { 
                          EUR: 0.92, 
                          GBP: 0.78 
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Invalid parameters'
            },
            '500': {
              description: 'External API unavailable'
            }
          }
        }
      },
      '/user': {
        get: {
          summary: 'Get current user preferences',
          description: 'Returns the current user\'s base currency and favorite currencies',
          tags: ['User'],
          responses: {
            '200': {
              description: 'User data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user_id: { 
                        type: 'string', 
                        format: 'uuid',
                        example: '123e4567-e89b-12d3-a456-426614174000'
                      },
                      base_currency: { 
                        type: 'string', 
                        example: 'USD' 
                      },
                      favorites: { 
                        type: 'array', 
                        items: { 
                          type: 'string' 
                        },
                        example: ['EUR', 'GBP']
                      },
                      created_at: { 
                        type: 'string', 
                        format: 'date-time',
                        example: '2024-01-01T00:00:00Z'
                      },
                      updated_at: { 
                        type: 'string', 
                        format: 'date-time',
                        example: '2024-01-01T00:00:00Z'
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Not authenticated'
            },
            '404': {
              description: 'User not found'
            }
          }
        },
        post: {
          summary: 'Update user preferences',
          description: 'Update base currency and favorite currencies for current user',
          tags: ['User'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    baseCurrency: { 
                      type: 'string', 
                      description: 'New base currency code',
                      example: 'EUR' 
                    },
                    favorites: { 
                      type: 'array', 
                      items: { 
                        type: 'string' 
                      },
                      description: 'List of favorite currency codes',
                      example: ['USD', 'GBP', 'JPY']
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Updated user data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user_id: { 
                        type: 'string', 
                        format: 'uuid' 
                      },
                      base_currency: { 
                        type: 'string', 
                        example: 'EUR' 
                      },
                      favorites: { 
                        type: 'array', 
                        items: { 
                          type: 'string' 
                        },
                        example: ['USD', 'GBP', 'JPY']
                      },
                      updated_at: { 
                        type: 'string', 
                        format: 'date-time' 
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Validation error'
            },
            '401': {
              description: 'Not authenticated'
            }
          }
        }
      }
    }
  };
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(minimalDoc));
  console.log(' Full minimal Swagger documentation created with all endpoints');
}
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(' Error:', err.stack);
  
  if (err.name === 'ZodError') {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: err 
    });
  }
  
  res.status(500).json({ 
    error: err.message || 'Internal server error' 
  });
});

export default app;