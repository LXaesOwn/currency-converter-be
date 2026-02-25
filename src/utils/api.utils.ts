import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';

export class ExternalApiError extends Error {
  public statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ExternalApiError';
    this.statusCode = statusCode;
  }
}

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.exchangeApi.url,
      timeout: 10000,
    });
  }

  async getRates(base: string, targets: string[]): Promise<Record<string, number>> {
    try {
      console.log(`Calling API for ${base} to ${targets.join(',')}`);
      
     
      const response = await this.client.get('/', {
        params: {
          from: base,
          to: targets.join(','),
        },
      });
      
      console.log('API response:', response.data);
      
      if (response.data && response.data.rates) {
        return response.data.rates;
      }
      
      throw new ExternalApiError('Invalid API response format');
    } catch (error) {
      console.error('API Error details:', error);
      
      if (axios.isAxiosError(error)) {
        throw new ExternalApiError(
          `Currency API error: ${error.message}`,
          error.response?.status
        );
      }
      
      throw new ExternalApiError('Currency API temporarily unavailable');
    }
  }

  async getSupportedCurrencies(): Promise<string[]> {
    try {
      const response = await axios.get('https://api.frankfurter.app/currencies');
      return Object.keys(response.data);
    } catch (error) {
      console.error('Currencies API Error:', error);
      
      
      return ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY', 'RUB'];
    }
  }
}

export const apiClient = new ApiClient();