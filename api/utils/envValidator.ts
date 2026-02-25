/**
 * Environment Variables Validator
 * Kiểm tra và validate các biến môi trường cần thiết
 */

export interface EnvConfig {
  // Database
  MONGO_URI?: string;
  MONGODB_URI?: string;
  
  // JWT
  JWT_SECRET?: string;
  
  // Server
  PORT?: string;
  NODE_ENV?: string;
  FRONTEND_URL?: string;
  
  // OAuth
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_CALLBACK_URL?: string;
  
  // Hugging Face / AI Provider
  HF_API_KEY?: string;
  HF_CHAT_MODEL?: string;
  HF_STT_MODEL?: string;
  
  // Stripe
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  
  // News API
  NEWS_API_KEY?: string;
  
  // Session
  SESSION_SECRET?: string;
  
  // Rate Limiting
  FREE_USER_DAILY_LIMIT?: string;
  AUTH_RATE_LIMIT?: string;
  AI_RATE_LIMIT?: string;
  
  // Upload
  MAX_FILE_SIZE?: string;
}

interface ValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

const env = process.env as NodeJS.ProcessEnv & Partial<EnvConfig>;

/**
 * Validate required environment variables
 */
export const validateEnv = (): ValidationResult => {
  const required: string[] = [
    'MONGO_URI',
    'JWT_SECRET',
  ];

const optionalButRecommended: string[] = [
    'HF_API_KEY',
    'STRIPE_SECRET_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEWS_API_KEY',
    'SESSION_SECRET',
  ];

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required vars
  required.forEach((key) => {
    // Check both MONGO_URI and MONGODB_URI for database
    if (key === 'MONGO_URI') {
      if (!env.MONGO_URI && !env.MONGODB_URI) {
        missing.push('MONGO_URI hoặc MONGODB_URI');
      }
    } else if (key === 'JWT_SECRET') {
      const jwtSecret = env.JWT_SECRET;
      if (!jwtSecret) {
        missing.push('JWT_SECRET');
      } else if (jwtSecret.length < 32) {
        warnings.push('JWT_SECRET should be at least 32 characters long for security');
      }
    } else if (!env[key as keyof EnvConfig]) {
      missing.push(key);
    }
  });

  // Check optional but recommended
  optionalButRecommended.forEach((key) => {
    if (!env[key as keyof EnvConfig]) {
      warnings.push(key);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
};

/**
 * Get environment variable with fallback
 */
export const getEnv = (key: string, defaultValue?: string): string => {
  return env[key as keyof EnvConfig] || defaultValue || '';
};

/**
 * Get environment variable as number
 */
export const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = env[key as keyof EnvConfig];
  if (!value) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Get environment variable as boolean
 */
export const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = env[key as keyof EnvConfig];
  if (!value) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
};
