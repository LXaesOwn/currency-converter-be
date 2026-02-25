import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config/env';

// Кастомные ошибки для API
export class ExternalApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'ExternalApiError';
  }
}

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.exchangeApi.url,
      timeout: 10000, // 10 секунд таймаут
    });

    // Добавляем интерцептор для обработки ошибок
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.code === 'ECONNABORTED') {
          throw new ExternalApiError('External API timeout');
        }
        if (error.response) {
          throw new ExternalApiError(
            `External API error: ${error.response.status}`,
            error.response.status
          );
        }
        if (error.request) {
          throw new ExternalApiError('No response from external API');
        }
        throw new ExternalApiError(error.message);
      }
    );
  }

  async getRates(base: string, targets: string[]): Promise<Record<string, number>> {
    try {
      const symbols = targets.join(',');
      const response = await this.client.get('/', {
        params: {
          base,
          symbols,
          ...(config.exchangeApi.key && { access_key: config.exchangeApi.key }),
        },
      });

      // Проверяем структуру ответа
      if (!response.data || !response.data.rates) {
        throw new ExternalApiError('Invalid API response structure');
      }

      return response.data.rates;
    } catch (error) {
      if (error instanceof ExternalApiError) {
        throw error;
      }
      throw new ExternalApiError('Unexpected error calling external API');
    }
  }

  async getSupportedCurrencies(): Promise<string[]> {
    try {
      const response = await this.client.get('/');
      
      if (!response.data || !response.data.rates) {
        throw new ExternalApiError('Invalid API response structure');
      }

      // Получаем все доступные валюты из объекта rates
      return Object.keys(response.data.rates);
    } catch (error) {
      if (error instanceof ExternalApiError) {
        throw error;
      }
      throw new ExternalApiError('Unexpected error calling external API');
    }
  }
}

export const apiClient = new ApiClient();