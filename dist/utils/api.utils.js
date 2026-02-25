"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = exports.ApiClient = exports.ExternalApiError = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
// Кастомные ошибки для API
class ExternalApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ExternalApiError';
    }
}
exports.ExternalApiError = ExternalApiError;
class ApiClient {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: env_1.config.exchangeApi.url,
            timeout: 10000, // 10 секунд таймаут
        });
        // Добавляем интерцептор для обработки ошибок
        this.client.interceptors.response.use((response) => response, (error) => {
            if (error.code === 'ECONNABORTED') {
                throw new ExternalApiError('External API timeout');
            }
            if (error.response) {
                throw new ExternalApiError(`External API error: ${error.response.status}`, error.response.status);
            }
            if (error.request) {
                throw new ExternalApiError('No response from external API');
            }
            throw new ExternalApiError(error.message);
        });
    }
    async getRates(base, targets) {
        try {
            const symbols = targets.join(',');
            const response = await this.client.get('/', {
                params: {
                    base,
                    symbols,
                    ...(env_1.config.exchangeApi.key && { access_key: env_1.config.exchangeApi.key }),
                },
            });
            // Проверяем структуру ответа
            if (!response.data || !response.data.rates) {
                throw new ExternalApiError('Invalid API response structure');
            }
            return response.data.rates;
        }
        catch (error) {
            if (error instanceof ExternalApiError) {
                throw error;
            }
            throw new ExternalApiError('Unexpected error calling external API');
        }
    }
    async getSupportedCurrencies() {
        try {
            const response = await this.client.get('/');
            if (!response.data || !response.data.rates) {
                throw new ExternalApiError('Invalid API response structure');
            }
            // Получаем все доступные валюты из объекта rates
            return Object.keys(response.data.rates);
        }
        catch (error) {
            if (error instanceof ExternalApiError) {
                throw error;
            }
            throw new ExternalApiError('Unexpected error calling external API');
        }
    }
}
exports.ApiClient = ApiClient;
exports.apiClient = new ApiClient();
