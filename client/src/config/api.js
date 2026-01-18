// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Default configuration
export const CONFIG = {
  API_URL,
  DEFAULT_EXCHANGE_RATE: 50,
  PAGINATION_LIMIT: 50,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};

export default CONFIG;
