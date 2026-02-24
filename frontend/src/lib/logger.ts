/**
 * Logger utility - only logs in development
 */

const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production' || import.meta.env.PROD;

export const logger = {
  log: (...args: any[]) => {
    if (isDev && !isProduction) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (isDev) {
      console.error(...args);
    } else {
      console.error('[Error]', args[0]);
    }
  },
  warn: (...args: any[]) => {
    if (isDev && !isProduction) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (isDev && !isProduction) {
      console.info(...args);
    }
  },
};

export const isDevelopment = isDev;
export const isProductionEnv = isProduction;
