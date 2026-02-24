import app from './app.js';
import dotenv from 'dotenv';
import { validateEnv } from './utils/envValidator.js';
import logger from './utils/logger.js';

dotenv.config();

// Validate environment variables
const validation = validateEnv();
if (!validation.isValid) {
  console.error('[ENV VALIDATION FAILED] Missing:', validation.missing);
  logger.error('Missing required environment variables', undefined, { missing: validation.missing });
  process.exit(1);
}

if (validation.warnings.length > 0) {
  logger.warn('Missing optional environment variables (some features may not work)', { warnings: validation.warnings });
}

// Sử dụng cổng 5001 để tránh lỗi trùng cổng 5000 cũ
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Xử lý tắt server gọn gàng khi bấm Ctrl + C
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});