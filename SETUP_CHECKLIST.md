# CV Mate - Setup Checklist

## ✅ Đã hoàn thành

### 1. Project Structure
- [x] Frontend (React + Vite + TypeScript)
- [x] Backend (Express + TypeScript)
- [x] Database Models (MongoDB/Mongoose)
- [x] Authentication (JWT + Google OAuth)
- [x] AI Features (OpenAI Integration)
- [x] Payment (Stripe)
- [x] File Upload (Multer)

### 2. Environment Variables
- [x] Backend `.env.example` created
- [x] Frontend `.env.example` created
- [x] All hardcoded values moved to env

## 🔧 Cần Setup

### Bước 1: Tạo file .env

#### Backend (api/.env)
```bash
cd api
cp .env.example .env
```

Sau đó chỉnh sửa các giá trị trong `api/.env`:

**Bắt buộc:**
- [ ] `MONGO_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - Secret key cho JWT (generate bằng: `openssl rand -base64 32`)
- [ ] `SESSION_SECRET` - Secret cho Express sessions
- [ ] `FRONTEND_URL` - URL của frontend (default: http://localhost:5173)

**Cho AI Features:**
- [ ] `OPENAI_API_KEY` - Lấy từ https://platform.openai.com/api-keys
- [ ] `OPENAI_MODEL` - Model name (default: gpt-3.5-turbo)

**Cho Payment:**
- [ ] `STRIPE_SECRET_KEY` - Lấy từ https://dashboard.stripe.com/apikeys
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook secret từ Stripe Dashboard

**Tùy chọn:**
- [ ] `GOOGLE_CLIENT_ID` - Cho Google OAuth
- [ ] `GOOGLE_CLIENT_SECRET` - Cho Google OAuth
- [ ] `GOOGLE_CALLBACK_URL` - Callback URL cho OAuth
- [ ] `NEWS_API_KEY` - Cho News API integration

#### Frontend (.env)
```bash
cp .env.example .env
```

Chỉnh sửa:
- [ ] `VITE_API_URL` - Backend API URL (default: http://localhost:5001/api)
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (optional)

### Bước 2: Cài đặt Dependencies

```bash
# Install root dependencies
npm install

# Backend dependencies đã được install trong root
# Nếu cần install riêng:
cd api
npm install
```

### Bước 3: Setup Database

#### MongoDB Local
```bash
# Windows
net start MongoDB

# Mac (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### MongoDB Atlas (Cloud)
1. Tạo account tại https://www.mongodb.com/cloud/atlas
2. Tạo cluster
3. Get connection string
4. Update `MONGO_URI` trong `api/.env`

### Bước 4: Setup OpenAI (Cho AI Features)

1. Đăng ký tại https://platform.openai.com
2. Tạo API key tại https://platform.openai.com/api-keys
3. Thêm vào `api/.env`:
   ```
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-3.5-turbo
   ```

### Bước 5: Setup Stripe (Cho Payment)

1. Đăng ký tại https://stripe.com
2. Lấy keys từ https://dashboard.stripe.com/apikeys
3. Thêm vào `api/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. Thêm vào frontend `.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
5. Setup webhook endpoint trong Stripe Dashboard:
   - URL: `https://your-api-domain.com/api/payment/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### Bước 6: Setup Google OAuth (Tùy chọn)

1. Tạo project tại https://console.cloud.google.com
2. Enable Google+ API
3. Tạo OAuth 2.0 credentials
4. Thêm vào `api/.env`:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
   ```
5. Thêm authorized redirect URIs trong Google Console

### Bước 7: Setup News API (Tùy chọn)

1. Đăng ký tại https://newsapi.org/register
2. Lấy API key
3. Thêm vào `api/.env`:
   ```
   NEWS_API_KEY=...
   ```

### Bước 8: Tạo thư mục uploads

```bash
mkdir -p uploads
```

Hoặc thư mục sẽ tự động được tạo khi upload file đầu tiên.

### Bước 9: Chạy ứng dụng

```bash
# Chạy cả frontend và backend
npm run dev

# Hoặc chạy riêng:
# Terminal 1 - Backend
cd api
npm run dev

# Terminal 2 - Frontend
npm run client:dev
```

### Bước 10: Kiểm tra

1. **Backend Health Check:**
   - Mở: http://localhost:5001/api/health
   - Phải thấy: `{"success":true,"message":"Server is healthy"}`

2. **Frontend:**
   - Mở: http://localhost:5173
   - Phải thấy trang Home

3. **Database:**
   - Kiểm tra MongoDB connection trong console
   - Phải thấy: `[MongoDB] Connected successfully`

## 📋 Checklist Setup

### Environment Variables
- [ ] `api/.env` đã được tạo và điền đầy đủ
- [ ] `.env` (frontend) đã được tạo và điền đầy đủ
- [ ] Tất cả required variables đã có giá trị

### Database
- [ ] MongoDB đang chạy (local hoặc Atlas)
- [ ] `MONGO_URI` đúng format
- [ ] Connection thành công (check console)

### AI Features
- [ ] OpenAI API key đã được thêm
- [ ] Test AI features (CV Enhance, Interview, ATS Check)

### Payment
- [ ] Stripe keys đã được thêm
- [ ] Webhook đã được setup
- [ ] Test payment flow

### OAuth (Optional)
- [ ] Google OAuth credentials đã được thêm
- [ ] Callback URL đã được config
- [ ] Test Google login

### File Upload
- [ ] Thư mục `uploads/` đã được tạo
- [ ] Test upload avatar

### Testing
- [ ] Backend health check OK
- [ ] Frontend load OK
- [ ] Register/Login hoạt động
- [ ] CV Builder hoạt động
- [ ] AI features hoạt động (nếu có API key)
- [ ] Payment flow hoạt động (nếu có Stripe keys)

## 🚨 Troubleshooting

### Backend không chạy
- Kiểm tra port 5001 có bị chiếm không
- Kiểm tra MongoDB connection
- Kiểm tra `.env` có đúng format không

### Frontend không kết nối được Backend
- Kiểm tra `VITE_API_URL` trong `.env`
- Kiểm tra backend có đang chạy không
- Kiểm tra CORS settings

### AI Features không hoạt động
- Kiểm tra `OPENAI_API_KEY` có đúng không
- Kiểm tra account có credit không
- Kiểm tra rate limits

### Payment không hoạt động
- Kiểm tra Stripe keys (test vs live)
- Kiểm tra webhook endpoint
- Kiểm tra frontend có `VITE_STRIPE_PUBLISHABLE_KEY` không

## 📝 Notes

- **Development**: Dùng test keys (Stripe test keys, OpenAI có free tier)
- **Production**: Phải dùng production keys và update URLs
- **Security**: Không commit `.env` files vào git
- **Backup**: Backup `.env` files trước khi deploy

## 🔗 Useful Links

- OpenAI API: https://platform.openai.com
- Stripe Dashboard: https://dashboard.stripe.com
- Google Cloud Console: https://console.cloud.google.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- News API: https://newsapi.org
