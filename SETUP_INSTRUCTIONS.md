# Hướng Dẫn Setup và Sửa Lỗi

## 🔧 Các Vấn Đề Đã Được Sửa

### 1. ✅ Chức Năng AI

**Vấn đề:** Các chức năng AI không hoạt động

**Nguyên nhân:** Thiếu hoặc sai cấu hình OpenAI API Key

**Giải pháp:**
1. Tạo file `.env` trong thư mục `api/` (nếu chưa có)
2. Thêm biến môi trường:
```env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

3. Khởi động lại server backend

**Các chức năng AI:**
- ✅ AI Interview Practice - Luyện phỏng vấn với AI
- ✅ AI CV Enhancement - Cải thiện nội dung CV
- ✅ AI Job Matching - Phân tích độ phù hợp CV với job

**Kiểm tra:**
- Vào `/interview` và thử bắt đầu một session
- Vào `/builder` và thử "AI Enhance" cho summary
- Vào `/jobs` và thử "AI Match Score"

### 2. ✅ Google OAuth Login

**Vấn đề:** Không đăng nhập được bằng Google

**Nguyên nhân:** Thiếu cấu hình Google OAuth credentials

**Giải pháp:**

#### Bước 1: Tạo Google OAuth Credentials
1. Vào https://console.cloud.google.com
2. Tạo project mới hoặc chọn project hiện có
3. Enable "Google+ API" hoặc "Google Identity Services"
4. Vào "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Chọn "Web application"
6. Thêm Authorized redirect URIs:
   - Development: `http://localhost:5001/api/auth/google/callback`
   - Production: `https://yourdomain.com/api/auth/google/callback`

#### Bước 2: Cấu hình Backend
Thêm vào file `.env` trong thư mục `api/`:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

#### Bước 3: Cấu hình Frontend
Đảm bảo trong file `.env` của frontend:
```env
VITE_API_URL=http://localhost:5001/api
```

#### Bước 4: Khởi động lại server
```bash
cd api
npm run dev
```

**Kiểm tra:**
- Vào `/login` hoặc `/register`
- Click "Sign in with Google"
- Nếu redirect về Google và quay lại thành công → OK

### 3. ✅ Pricing Page

**Đã tạo:** Trang `/pricing` với:
- So sánh giữa Free và Premium
- Bảng giá với monthly/yearly billing
- Comparison table chi tiết
- FAQ section
- Beautiful UI với animations

**Truy cập:**
- URL: `/pricing`
- Link trong navbar (icon Crown)
- Link trong Footer
- Button "Xem Bảng Giá" trên Home page

## 📋 Checklist Setup

### Backend (api/.env)
- [ ] `OPENAI_API_KEY` - Bắt buộc cho AI features
- [ ] `OPENAI_MODEL` - Optional (default: gpt-3.5-turbo)
- [ ] `GOOGLE_CLIENT_ID` - Cho Google OAuth
- [ ] `GOOGLE_CLIENT_SECRET` - Cho Google OAuth
- [ ] `GOOGLE_CALLBACK_URL` - Callback URL cho Google OAuth
- [ ] `JWT_SECRET` - Bắt buộc
- [ ] `MONGODB_URI` - Bắt buộc
- [ ] `FRONTEND_URL` - URL của frontend

### Frontend (.env)
- [ ] `VITE_API_URL` - URL của backend API

## 🐛 Troubleshooting

### AI không hoạt động
1. Kiểm tra `OPENAI_API_KEY` có đúng không
2. Kiểm tra API key có credit không
3. Kiểm tra console log để xem lỗi cụ thể
4. Thử với API key mới

### Google OAuth không hoạt động
1. Kiểm tra callback URL có đúng không
2. Kiểm tra Google Console có enable API chưa
3. Kiểm tra domain có được authorize chưa
4. Kiểm tra `FRONTEND_URL` có đúng không

### Pricing page không hiển thị
1. Kiểm tra route đã được thêm vào `App.tsx` chưa
2. Kiểm tra import có đúng không
3. Clear cache và reload

## 📝 Notes

- Tất cả các tính năng AI đều cần `OPENAI_API_KEY`
- Google OAuth chỉ hoạt động khi có đủ 3 biến: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- Pricing page đã được tích hợp vào navigation
