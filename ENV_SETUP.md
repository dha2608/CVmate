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

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Session Secret (cho OAuth)
SESSION_SECRET=your-session-secret-key-change-this

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
# Hoặc gpt-4o-mini cho production

# Google OAuth 2.0
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

## Hướng Dẫn Setup Google OAuth

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

## Các Tính Năng Đã Triển Khai

### ✅ Module 1: Auth & User Dashboard
- [x] Email/Password authentication
- [x] Google OAuth 2.0
- [x] Onboarding flow (career goal selection)
- [x] User dashboard với thống kê

### ✅ Module 2: CV Builder (CORE)
- [x] ATS-friendly template
- [x] AI Enhance (biến input thô thành văn phong chuyên nghiệp)
- [x] ATS Checker với JD comparison
- [x] PDF Export (text selectable với jsPDF)

### ✅ Module 3: AI Interview Simulator
- [x] 3 Personas (Friendly HR, Strict Manager, English Native)
- [x] Chat interface
- [x] Speech-to-Text (Web Speech API)
- [x] AI Feedback với điểm số và gợi ý

### ✅ Module 4: Community
- [x] Newsfeed với posts
- [x] Like và Comment
- [x] Share CV (đã có cơ bản)

### ✅ Module 5: Blog
- [x] CMS Admin (đã có cơ bản)
- [x] AI Summary (có thể thêm vào Article model)

### ✅ Yêu Cầu Phi Chức Năng
- [x] Rate Limiting (10 req/day cho free user, 20 req/hour cho AI)
- [x] SEO Meta tags động
- [x] Design System (Minimalist với Crimson Red accent)

## Rate Limiting

- **Free Users:** 10 requests/day cho ATS Checker và Interview sessions
- **AI Endpoints:** 20 requests/hour cho AI Enhance và Interview chat
- **Auth Endpoints:** 5 requests/15 minutes cho login/register

## Notes

- Speech-to-Text sử dụng Web Speech API của browser (Chrome/Edge recommended)
- PDF Export sử dụng jsPDF + html2canvas (fallback về print nếu lỗi)
- Google OAuth cần HTTPS trong production
- Tất cả API endpoints đều có error handling và fallback

## Troubleshooting

### Google OAuth không hoạt động:
- Kiểm tra redirect URI đúng chưa
- Đảm bảo Google+ API đã được enable
- Kiểm tra CORS settings trong backend

### OpenAI API lỗi:
- Kiểm tra API key đúng chưa
- Kiểm tra billing/quota của OpenAI account
- Code có fallback mock data nếu API unavailable

### Speech Recognition không hoạt động:
- Chỉ hỗ trợ Chrome/Edge
- Cần microphone permission
- Kiểm tra HTTPS (production) hoặc localhost (development)
