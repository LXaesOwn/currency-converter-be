import axios from 'axios';
import { EXCHANGE_RATE_API_URL, EXCHANGE_RATE_API_KEY } from '../config/env';
export const apiClient = axios.create({
  baseURL: EXCHANGE_RATE_API_URL,
  timeout: 5000,
  params: {
    access_key: EXCHANGE_RATE_API_KEY
  }
});
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    throw new Error('External currency API is unavailable. Please try again later.');
  }
);