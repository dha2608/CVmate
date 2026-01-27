import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

// Sử dụng cổng 5001 để tránh lỗi trùng cổng 5000 cũ
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Xử lý tắt server gọn gàng khi bấm Ctrl + C
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});