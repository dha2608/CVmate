# Tóm tắt Setup - CV Mate

## ✅ Đã hoàn thành

### 1. Environment Variables
- ✅ Tạo `api/.env.example` với tất cả biến môi trường
- ✅ Tạo `.env.example` cho frontend
- ✅ Di chuyển tất cả hardcoded values vào env variables
- ✅ Fix các file sử dụng hardcoded values

### 2. Code Improvements
- ✅ `api/config/db.ts` - Hỗ trợ cả `MONGO_URI` và `MONGODB_URI`
- ✅ `api/middleware/rateLimiter.ts` - Rate limits từ env
- ✅ `api/middleware/upload.ts` - Max file size từ env
- ✅ `vite.config.ts` - Proxy target từ env
- ✅ `src/pages/AuthCallback.tsx` - API URL từ env
- ✅ Tất cả hardcoded localhost URLs đã được thay bằng env variables

### 3. Documentation
- ✅ `SETUP_CHECKLIST.md` - Checklist setup chi tiết
- ✅ `ENV_VARIABLES_SUMMARY.md` - Tổng hợp tất cả env variables
- ✅ `.gitignore` - Đảm bảo .env files không bị commit

## 🔧 Cần làm tiếp

### Bước 1: Tạo file .env

#### Backend
```bash
cd api
copy .env.example .env
# Hoặc trên Mac/Linux:
# cp .env.example .env
```

Sau đó chỉnh sửa `api/.env` và điền các giá trị:

**Bắt buộc:**
- `MONGO_URI` hoặc `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Generate bằng: `openssl rand -base64 32`
- `SESSION_SECRET` - Random string
- `FRONTEND_URL` - `http://localhost:5173`

**Cho AI Features:**
- `OPENAI_API_KEY` - Lấy từ https://platform.openai.com/api-keys
- `OPENAI_MODEL` - `gpt-3.5-turbo` (default)

**Cho Payment:**
- `STRIPE_SECRET_KEY` - Lấy từ https://dashboard.stripe.com/apikeys
- `STRIPE_WEBHOOK_SECRET` - Webhook secret

**Tùy chọn:**
- `GOOGLE_CLIENT_ID` - Cho Google OAuth
- `GOOGLE_CLIENT_SECRET` - Cho Google OAuth
- `NEWS_API_KEY` - Cho News API

#### Frontend
```bash
copy .env.example .env
# Hoặc trên Mac/Linux:
# cp .env.example .env
```

Chỉnh sửa `.env`:
- `VITE_API_URL` - `http://localhost:5001/api`

### Bước 2: Setup Database

**MongoDB Local:**
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**MongoDB Atlas (Cloud):**
1. Tạo account tại https://www.mongodb.com/cloud/atlas
2. Tạo cluster và get connection string
3. Update `MONGO_URI` trong `api/.env`

### Bước 3: Setup OpenAI (Cho AI Features)

1. Đăng ký tại https://platform.openai.com
2. Tạo API key
3. Thêm vào `api/.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```

### Bước 4: Setup Stripe (Cho Payment)

1. Đăng ký tại https://stripe.com
2. Lấy keys từ dashboard
3. Thêm vào `api/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. Setup webhook endpoint trong Stripe Dashboard

### Bước 5: Chạy ứng dụng

```bash
# Chạy cả frontend và backend
npm run dev

# Hoặc riêng:
# Terminal 1 - Backend
cd api
npm run dev

# Terminal 2 - Frontend
npm run client:dev
```

## 📋 Checklist nhanh

- [ ] `api/.env` đã được tạo từ `api/.env.example`
- [ ] `.env` (frontend) đã được tạo từ `.env.example`
- [ ] MongoDB đang chạy
- [ ] `MONGO_URI` đã được điền
- [ ] `JWT_SECRET` đã được generate và điền
- [ ] (Optional) `OPENAI_API_KEY` đã được điền
- [ ] (Optional) Stripe keys đã được điền
- [ ] Backend chạy OK (check http://localhost:5001/api/health)
- [ ] Frontend chạy OK (check http://localhost:5173)

## 📝 Files quan trọng

- `api/.env.example` - Template cho backend env
- `.env.example` - Template cho frontend env
- `SETUP_CHECKLIST.md` - Checklist chi tiết
- `ENV_VARIABLES_SUMMARY.md` - Tổng hợp env variables
- `.gitignore` - Đảm bảo .env không bị commit

## 🚨 Lưu ý

1. **KHÔNG commit `.env` files vào git**
2. **Sử dụng `.env.example` làm template**
3. **Production**: Dùng strong secrets và production keys
4. **Development**: Có thể dùng test keys

## 🔗 Links hữu ích

- OpenAI: https://platform.openai.com
- Stripe: https://dashboard.stripe.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Google Cloud: https://console.cloud.google.com
