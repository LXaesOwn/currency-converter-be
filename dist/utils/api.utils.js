"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = exports.ApiClient = exports.ExternalApiError = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
class ExternalApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'ExternalApiError';
        this.statusCode = statusCode;
    }
}
exports.ExternalApiError = ExternalApiError;
class ApiClient {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: env_1.config.exchangeApi.url,
            timeout: 10000,
        });
    }
    async getRates(base, targets) {
        try {
            console.log(`Calling API for ${base} to ${targets.join(',')}`);
            // Для Frankfurter API
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
        }
        catch (error) {
            console.error('API Error details:', error);
            if (axios_1.default.isAxiosError(error)) {
                throw new ExternalApiError(`Currency API error: ${error.message}`, error.response?.status);
            }
            throw new ExternalApiError('Currency API temporarily unavailable');
        }
    }
    async getSupportedCurrencies() {
        try {
            const response = await axios_1.default.get('https://api.frankfurter.app/currencies');
            return Object.keys(response.data);
        }
        catch (error) {
            console.error('Currencies API Error:', error);
            // Возвращаем базовый список если API недоступен
            return ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY', 'RUB'];
        }
    }
}
exports.ApiClient = ApiClient;
exports.apiClient = new ApiClient();
