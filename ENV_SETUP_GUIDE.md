# Hướng Dẫn Cấu Hình Môi Trường - CV Mate

## Biến Môi Trường Cần Thiết

Tạo file `.env` trong thư mục root của project với các biến sau:

### Backend (.env trong root hoặc api/)

```env
# Server
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/cvmate
# Hoặc MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cvmate

# JWT Secret (Bắt buộc - ít nhất 32 ký tự)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Session Secret (cho OAuth)
SESSION_SECRET=your-session-secret-key-change-this

# OpenAI API (Cho các chức năng AI)
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
# Hoặc gpt-4o-mini cho production

# Google OAuth 2.0 (Cho đăng nhập Google)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
# Production: https://yourdomain.com/api/auth/google/callback

# Frontend URL (cho CORS và OAuth redirect)
FRONTEND_URL=http://localhost:5173
# Production: https://yourdomain.com
```

### Frontend (.env trong root)

```env
VITE_API_URL=http://localhost:5001/api
# Production: https://api.yourdomain.com/api
```

---

## Hướng Dẫn Setup Chi Tiết

### 1. OpenAI API Key

**Cách lấy API Key:**
1. Đăng ký tài khoản tại https://platform.openai.com
2. Vào API Keys section
3. Tạo API key mới
4. Copy và paste vào file `.env`

**Lưu ý:** 
- Các chức năng AI sẽ không hoạt động nếu không có API key này
- Cần có credits trong OpenAI account để sử dụng

### 2. Google OAuth 2.0

**Cách setup Google OAuth:**
1. **Truy cập Google Cloud Console:**
   - Vào https://console.cloud.google.com/
   - Tạo project mới hoặc chọn project hiện có

2. **Enable Google+ API:**
   - Vào "APIs & Services" > "Library"
   - Tìm "Google+ API" và enable

3. **Tạo OAuth 2.0 Credentials:**
   - Vào "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Chọn "Web application"
   - Thêm Authorized redirect URIs:
     - Development: `http://localhost:5001/api/auth/google/callback`
     - Production: `https://yourdomain.com/api/auth/google/callback`

4. **Copy Client ID và Client Secret:**
   - Paste vào file `.env` như trên

**Lưu ý:** 
- Đăng nhập Google sẽ không hoạt động nếu không có các biến này
- Google OAuth cần HTTPS trong production

### 3. JWT Secret

**Cách tạo:** Sử dụng một chuỗi ngẫu nhiên mạnh, ít nhất 32 ký tự.

**Ví dụ:**
```bash
# Sử dụng openssl
openssl rand -base64 32
```

### 4. MongoDB

**Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/cvmate
```

**MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cvmate
```

---

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

### Kiểm tra Database
- Server sẽ tự động kết nối khi khởi động
- Kiểm tra logs để xem connection status

---

## Troubleshooting

### Lỗi "OpenAI API rate limit exceeded"
- Bạn đã vượt quá giới hạn API của OpenAI
- Đợi một chút rồi thử lại
- Hoặc nâng cấp plan của OpenAI
- Kiểm tra billing/quota của OpenAI account

### Lỗi "Service temporarily unavailable"
- OpenAI service đang gặp sự cố
- Đợi vài phút rồi thử lại
- Code có fallback mock data nếu API unavailable

### Google OAuth không hoạt động
- Kiểm tra redirect URI có đúng không
- Đảm bảo Google+ API đã được enable
- Kiểm tra CORS settings trong backend
- Kiểm tra Google Console có enable API chưa
- Kiểm tra domain có được authorize chưa

### Speech Recognition không hoạt động
- Chỉ hỗ trợ Chrome/Edge
- Cần microphone permission
- Kiểm tra HTTPS (production) hoặc localhost (development)

### Database Connection Failed
- Kiểm tra MongoDB đang chạy (local)
- Kiểm tra connection string đúng chưa
- Kiểm tra network/firewall (Atlas)
- Kiểm tra credentials

---

## Production Checklist

- [ ] Đã set tất cả biến môi trường
- [ ] OPENAI_API_KEY đã được set và có credits
- [ ] Google OAuth đã được config với production URLs
- [ ] JWT_SECRET là một chuỗi ngẫu nhiên mạnh (32+ ký tự)
- [ ] SESSION_SECRET là một chuỗi ngẫu nhiên mạnh
- [ ] MONGODB_URI đã được set và accessible
- [ ] FRONTEND_URL đã được set đúng (HTTPS)
- [ ] VITE_API_URL đã được set đúng trong frontend (HTTPS)
- [ ] NODE_ENV=production
- [ ] CORS settings đã được config đúng

---

## Rate Limiting

- **Free Users:** 10 requests/day cho ATS Checker và Interview sessions
- **AI Endpoints:** 20 requests/hour cho AI Enhance và Interview chat
- **Auth Endpoints:** 5 requests/15 minutes cho login/register

---

## Notes

- Speech-to-Text sử dụng Web Speech API của browser (Chrome/Edge recommended)
- PDF Export sử dụng jsPDF + html2canvas (fallback về print nếu lỗi)
- Google OAuth cần HTTPS trong production
- Tất cả API endpoints đều có error handling và fallback
