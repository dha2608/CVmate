/**
 * Script kiểm tra cấu hình Environment Variables
 * Chạy: node api/scripts/check-env.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env từ root hoặc api/
dotenv.config({ path: join(__dirname, '../../.env') });
dotenv.config({ path: join(__dirname, '../.env') });

console.log('\n🔍 KIỂM TRA CẤU HÌNH ENVIRONMENT VARIABLES\n');
console.log('='.repeat(60));

// Required variables
const required = {
  'MONGO_URI hoặc MONGODB_URI': process.env.MONGO_URI || process.env.MONGODB_URI,
  'JWT_SECRET': process.env.JWT_SECRET,
};

// Optional but important
const optional = {
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
  'OPENAI_MODEL': process.env.OPENAI_MODEL || 'gpt-3.5-turbo (default)',
  'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
  'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
  'GOOGLE_CALLBACK_URL': process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback (default)',
  'FRONTEND_URL': process.env.FRONTEND_URL || 'http://localhost:5173 (default)',
  'SESSION_SECRET': process.env.SESSION_SECRET || 'cvmate-secret-key (default)',
  'NEWS_API_KEY': process.env.NEWS_API_KEY,
  'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
};

console.log('\n📋 BIẾN BẮT BUỘC (Required):');
console.log('-'.repeat(60));
let hasRequiredErrors = false;
for (const [key, value] of Object.entries(required)) {
  if (value) {
    const displayValue = key.includes('SECRET') || key.includes('URI') 
      ? value.substring(0, 20) + '...' 
      : value;
    console.log(`✅ ${key}: ${displayValue}`);
  } else {
    console.log(`❌ ${key}: CHƯA ĐƯỢC CẤU HÌNH`);
    hasRequiredErrors = true;
  }
}

console.log('\n📋 BIẾN TÙY CHỌN (Optional - Quan trọng cho tính năng):');
console.log('-'.repeat(60));
let hasOptionalWarnings = false;

// Check OpenAI
if (optional.OPENAI_API_KEY) {
  const masked = optional.OPENAI_API_KEY.substring(0, 7) + '...' + optional.OPENAI_API_KEY.slice(-4);
  console.log(`✅ OPENAI_API_KEY: ${masked}`);
  console.log(`✅ OPENAI_MODEL: ${optional.OPENAI_MODEL}`);
} else {
  console.log(`⚠️  OPENAI_API_KEY: CHƯA ĐƯỢC CẤU HÌNH - Các tính năng AI sẽ không hoạt động`);
  hasOptionalWarnings = true;
}

// Check Google OAuth
if (optional.GOOGLE_CLIENT_ID && optional.GOOGLE_CLIENT_SECRET) {
  console.log(`✅ GOOGLE_CLIENT_ID: ${optional.GOOGLE_CLIENT_ID.substring(0, 30)}...`);
  console.log(`✅ GOOGLE_CLIENT_SECRET: ${optional.GOOGLE_CLIENT_SECRET.substring(0, 10)}...`);
  console.log(`✅ GOOGLE_CALLBACK_URL: ${optional.GOOGLE_CALLBACK_URL}`);
  console.log(`✅ FRONTEND_URL: ${optional.FRONTEND_URL}`);
} else {
  console.log(`⚠️  GOOGLE_CLIENT_ID: ${optional.GOOGLE_CLIENT_ID ? '✅' : '❌ CHƯA ĐƯỢC CẤU HÌNH'}`);
  console.log(`⚠️  GOOGLE_CLIENT_SECRET: ${optional.GOOGLE_CLIENT_SECRET ? '✅' : '❌ CHƯA ĐƯỢC CẤU HÌNH'}`);
  console.log(`   → Đăng nhập Google sẽ không hoạt động`);
  hasOptionalWarnings = true;
}

// Other optional
if (optional.SESSION_SECRET && optional.SESSION_SECRET !== 'cvmate-secret-key (default)') {
  console.log(`✅ SESSION_SECRET: Đã cấu hình`);
} else {
  console.log(`⚠️  SESSION_SECRET: Sử dụng giá trị mặc định (không an toàn cho production)`);
}

if (optional.NEWS_API_KEY) {
  console.log(`✅ NEWS_API_KEY: Đã cấu hình`);
} else {
  console.log(`⚠️  NEWS_API_KEY: CHƯA ĐƯỢC CẤU HÌNH - Tính năng tin tức có thể bị giới hạn`);
}

if (optional.STRIPE_SECRET_KEY) {
  console.log(`✅ STRIPE_SECRET_KEY: Đã cấu hình`);
} else {
  console.log(`⚠️  STRIPE_SECRET_KEY: CHƯA ĐƯỢC CẤU HÌNH - Thanh toán sẽ không hoạt động`);
}

console.log('\n' + '='.repeat(60));

// Summary
console.log('\n📊 TÓM TẮT:');
if (hasRequiredErrors) {
  console.log('❌ CÓ LỖI: Một số biến bắt buộc chưa được cấu hình!');
  console.log('   → Server sẽ không khởi động được.');
} else {
  console.log('✅ Tất cả biến bắt buộc đã được cấu hình.');
}

if (hasOptionalWarnings) {
  console.log('⚠️  CẢNH BÁO: Một số tính năng có thể không hoạt động.');
} else {
  console.log('✅ Tất cả tính năng chính đã được cấu hình.');
}

console.log('\n💡 HƯỚNG DẪN:');
console.log('1. Tạo file .env trong thư mục root hoặc api/');
console.log('2. Tham khảo ENV_SETUP.md hoặc SETUP_INSTRUCTIONS.md');
console.log('3. Khởi động lại server sau khi cấu hình');
console.log('\n');
