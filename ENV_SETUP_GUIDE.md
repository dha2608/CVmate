# Hướng Dẫn Cấu Hình Môi Trường

## Các Biến Môi Trường Cần Thiết

### 1. OpenAI API Key (Cho các chức năng AI)

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo  # hoặc gpt-4
```

**Cách lấy API Key:**
1. Đăng ký tài khoản tại https://platform.openai.com
2. Vào API Keys section
3. Tạo API key mới
4. Copy và paste vào file `.env`

**Lưu ý:** Các chức năng AI sẽ không hoạt động nếu không có API key này.

### 2. Google OAuth (Cho đăng nhập Google)

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
```

**Cách setup Google OAuth:**
1. Vào https://console.cloud.google.com
2. Tạo project mới hoặc chọn project hiện có
3. Enable Google+ API
4. Tạo OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:5001/api/auth/google/callback` (development)
   - Authorized redirect URIs: `https://yourdomain.com/api/auth/google/callback` (production)
5. Copy Client ID và Client Secret vào `.env`

**Lưu ý:** Đăng nhập Google sẽ không hoạt động nếu không có các biến này.

### 3. JWT Secret (Bắt buộc)

```env
JWT_SECRET=your-super-secret-jwt-key-here
```

**Cách tạo:** Sử dụng một chuỗi ngẫu nhiên mạnh, ít nhất 32 ký tự.

### 4. Database MongoDB (Bắt buộc)

```env
MONGODB_URI=mongodb://localhost:27017/cvmate
# hoặc MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cvmate
```

### 5. Frontend URL

```env
FRONTEND_URL=http://localhost:5173
# Production
FRONTEND_URL=https://yourdomain.com
```

### 6. API URL (Frontend)

Trong file `.env` của frontend:
```env
VITE_API_URL=http://localhost:5001/api
# Production
VITE_API_URL=https://api.yourdomain.com/api
```

## Kiểm Tra Cấu Hình

### Kiểm tra OpenAI
- Vào trang Interview hoặc CV Builder
- Thử sử dụng tính năng AI
- Nếu có lỗi "OpenAI API key is not configured", kiểm tra lại biến môi trường

### Kiểm tra Google OAuth
- Vào trang Login
- Click "Sign in with Google"
- Nếu redirect về trang lỗi, kiểm tra:
  - GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET
  - GOOGLE_CALLBACK_URL phải khớp với cấu hình trong Google Console
  - FRONTEND_URL phải đúng

## Troubleshooting

### Lỗi "OpenAI API rate limit exceeded"
- Bạn đã vượt quá giới hạn API của OpenAI
- Đợi một chút rồi thử lại
- Hoặc nâng cấp plan của OpenAI

### Lỗi "Service temporarily unavailable"
- OpenAI service đang gặp sự cố
- Đợi vài phút rồi thử lại

### Google OAuth không hoạt động
- Kiểm tra callback URL có đúng không
- Kiểm tra Google Console có enable API chưa
- Kiểm tra domain có được authorize chưa

## Production Checklist

- [ ] Đã set tất cả biến môi trường
- [ ] OPENAI_API_KEY đã được set
- [ ] Google OAuth đã được config với production URLs
- [ ] JWT_SECRET là một chuỗi ngẫu nhiên mạnh
- [ ] MONGODB_URI đã được set
- [ ] FRONTEND_URL đã được set đúng
- [ ] VITE_API_URL đã được set đúng trong frontend
