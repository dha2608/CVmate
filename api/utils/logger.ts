/**
 * Logger utility để thay thế console.log/error
 * Hỗ trợ các mức độ log: info, warn, error, debug
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  stack?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatMessage(level: LogLevel, message: string, data?: unknown, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (data) {
      entry.data = data;
    }

    if (error && error.stack) {
      entry.stack = error.stack;
    }

    return entry;
  }

  private log(level: LogLevel, message: string, data?: unknown, error?: Error): void {
    const entry = this.formatMessage(level, message, data, error);

    if (!this.isDevelopment) {
      // Production: chỉ log error và warn
      if (level === 'error' || level === 'warn') {
        console[level](JSON.stringify(entry));
      }
      return;
    }

    // Development: log tất cả với format đẹp
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
    
    switch (level) {
      case 'error':
        console.error(prefix, message, data || '', error?.stack || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'debug':
        console.debug(prefix, message, data || '');
        break;
      default:
        console.log(prefix, message, data || '');
    }
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | unknown, data?: unknown): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.log('error', err.message, data, err);
  }

  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      this.log('debug', message, data);
    }
  }
}

export const logger = new Logger();
export default logger;
