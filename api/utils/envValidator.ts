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
  errors: Array<{ key: string; message: string }>;
}

interface FeatureConfig {
  name: string;
  required: string[];
  optional: string[];
  message: string;
}

/**
 * Validate required environment variables
 */
export const validateEnv = (): ValidationResult => {
  const required: string[] = [
    'MONGO_URI',
    'JWT_SECRET',
  ];

const env = process.env as NodeJS.ProcessEnv & Partial<EnvConfig>;

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
  const errors: Array<{ key: string; message: string }> = [];

  // Check required vars
  required.forEach((key) => {
    // Check both MONGO_URI and MONGODB_URI for database
    if (key === 'MONGO_URI') {
      if (!env.MONGO_URI && !env.MONGODB_URI) {
        missing.push('MONGO_URI hoặc MONGODB_URI');
        errors.push({
          key: 'MONGO_URI',
          message: 'Database connection string is required. Set either MONGO_URI or MONGODB_URI',
        });
      }
    } else if (key === 'JWT_SECRET') {
      const jwtSecret = env.JWT_SECRET;
      if (!jwtSecret) {
        missing.push('JWT_SECRET');
        errors.push({
          key: 'JWT_SECRET',
          message: 'JWT_SECRET is required for authentication. Must be at least 32 characters.',
        });
      } else if (jwtSecret.length < 32) {
        warnings.push('JWT_SECRET should be at least 32 characters long for security');
        errors.push({
          key: 'JWT_SECRET',
          message: `JWT_SECRET is too short (${jwtSecret.length} chars). Minimum 32 characters required for security.`,
        });
      }
    } else if (!env[key as keyof EnvConfig]) {
      missing.push(key);
      errors.push({
        key,
        message: `${key} is required but not set`,
      });
    }
  });

  // Check optional but recommended
  optionalButRecommended.forEach((key) => {
    if (!env[key as keyof EnvConfig]) {
      warnings.push(key);
    }
  });

  return {
    isValid: missing.length === 0 && errors.length === 0,
    missing,
    warnings,
    errors,
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

/**
 * Validate feature-specific environment variables
 * Returns detailed information about what features are available
 */
export const validateFeatureConfig = (feature: 'ai' | 'payment' | 'oauth' | 'news'): {
  available: boolean;
  missing: string[];
  message: string;
} => {
  const features: Record<string, FeatureConfig> = {
    ai: {
      name: 'AI Features',
      required: ['HF_API_KEY'],
      optional: ['HF_CHAT_MODEL', 'HF_STT_MODEL'],
      message: 'AI features (CV Enhance, Interview, ATS Checker) require HF_API_KEY',
    },
    payment: {
      name: 'Payment Features',
      required: ['STRIPE_SECRET_KEY'],
      optional: ['STRIPE_WEBHOOK_SECRET', 'PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'],
      message: 'Payment features require STRIPE_SECRET_KEY or PayPal credentials',
    },
    oauth: {
      name: 'Google OAuth',
      required: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
      optional: ['GOOGLE_CALLBACK_URL'],
      message: 'Google OAuth requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET',
    },
    news: {
      name: 'News Features',
      required: ['NEWS_API_KEY'],
      optional: [],
      message: 'News features require NEWS_API_KEY',
    },
  };

  const config = features[feature];
  if (!config) {
    return {
      available: false,
      missing: [],
      message: `Unknown feature: ${feature}`,
    };
  }

  const env = process.env as NodeJS.ProcessEnv & Partial<EnvConfig>;
  const missing: string[] = [];

  config.required.forEach((key) => {
    if (!env[key as keyof EnvConfig]) {
      missing.push(key);
    }
  });

  return {
    available: missing.length === 0,
    missing,
    message: missing.length > 0 
      ? `${config.message}. Missing: ${missing.join(', ')}`
      : `${config.name} is properly configured`,
  };
};

/**
 * Get comprehensive environment validation report
 */
export const getEnvReport = (): {
  isValid: boolean;
  required: { valid: boolean; missing: string[]; errors: Array<{ key: string; message: string }> };
  features: {
    ai: ReturnType<typeof validateFeatureConfig>;
    payment: ReturnType<typeof validateFeatureConfig>;
    oauth: ReturnType<typeof validateFeatureConfig>;
    news: ReturnType<typeof validateFeatureConfig>;
  };
  warnings: string[];
} => {
  const validation = validateEnv();
  
  return {
    isValid: validation.isValid,
    required: {
      valid: validation.isValid,
      missing: validation.missing,
      errors: validation.errors,
    },
    features: {
      ai: validateFeatureConfig('ai'),
      payment: validateFeatureConfig('payment'),
      oauth: validateFeatureConfig('oauth'),
      news: validateFeatureConfig('news'),
    },
    warnings: validation.warnings,
  };
};
