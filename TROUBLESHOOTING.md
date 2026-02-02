# 🔧 Hướng Dẫn Khắc Phục Sự Cố - CV Mate

## Vấn Đề: Không Đăng Nhập Được Bằng Google OAuth

### Bước 1: Kiểm Tra Environment Variables

Chạy script kiểm tra:
```bash
node api/scripts/check-env.js
```

Hoặc kiểm tra thủ công trong file `.env` (ở root hoặc `api/`):

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your-session-secret
```

### Bước 2: Kiểm Tra Google Cloud Console

1. **Truy cập:** https://console.cloud.google.com
2. **Chọn project** của bạn
3. **Vào:** APIs & Services > Credentials
4. **Kiểm tra OAuth 2.0 Client ID:**
   - ✅ Client ID và Secret phải khớp với `.env`
   - ✅ **Authorized redirect URIs** phải bao gồm:
     - Development: `http://localhost:5001/api/auth/google/callback`
     - Production: `https://yourdomain.com/api/auth/google/callback`

### Bước 3: Kiểm Tra API đã được Enable

Trong Google Cloud Console:
- ✅ **Google+ API** hoặc **Google Identity Services** phải được **ENABLED**

### Bước 4: Kiểm Tra Server Logs

Khởi động server và xem logs:
```bash
cd api
npm run dev
```

Tìm các dòng:
- ✅ `✅ Google OAuth strategy initialized` → Đã cấu hình đúng
- ❌ `⚠️ Google OAuth not configured` → Thiếu env vars

### Bước 5: Kiểm Tra Network Requests

Mở Browser DevTools (F12) > Network tab:
1. Click "Đăng nhập với Google"
2. Xem request đến `/api/auth/google`
3. Nếu thấy `503` hoặc error message → Kiểm tra lại env vars
4. Nếu redirect đến Google nhưng callback fail → Kiểm tra callback URL

### Bước 6: Kiểm Tra CORS và Frontend URL

Trong `api/app.ts`, đảm bảo:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

Và trong `api/controllers/authController.ts`:
```typescript
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
```

### Bước 7: Test Thủ Công

1. **Test endpoint trực tiếp:**
   ```bash
   curl http://localhost:5001/api/auth/google
   ```
   - Nếu redirect → OK
   - Nếu 503 → Chưa cấu hình

2. **Kiểm tra callback URL:**
   - Phải khớp chính xác với Google Console
   - Không có trailing slash
   - Đúng protocol (http/https)

---

## Vấn Đề: Các Tính Năng AI Không Hoạt Động

### Bước 1: Kiểm Tra OpenAI API Key

Chạy script kiểm tra:
```bash
node api/scripts/check-env.js
```

Hoặc kiểm tra trong `.env`:
```env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

### Bước 2: Kiểm Tra API Key Có Hợp Lệ

1. **Truy cập:** https://platform.openai.com/api-keys
2. **Kiểm tra:**
   - ✅ API key có tồn tại
   - ✅ Chưa bị revoke
   - ✅ Có đủ credits/quota

### Bước 3: Test API Key

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-your-api-key-here"
```

Nếu trả về danh sách models → API key hợp lệ.

### Bước 4: Kiểm Tra Server Logs

Khi sử dụng tính năng AI, xem logs:
- ❌ `OpenAI API key is not configured` → Thiếu env var
- ❌ `Invalid OpenAI API key` → API key sai
- ❌ `OpenAI API rate limit exceeded` → Hết quota
- ❌ `OpenAI service unavailable` → Lỗi từ OpenAI

### Bước 5: Kiểm Tra Tính Năng Cụ Thể

#### AI Interview Practice (`/interview`)
- Kiểm tra: `api/controllers/interviewController.ts`
- Endpoint: `POST /api/interviews/:id/message`
- Cần: `OPENAI_API_KEY`

#### AI Resume Enhancement (`/builder`)
- Kiểm tra: `api/controllers/resumeController.ts`
- Endpoint: `POST /api/resumes/ai-enhance`
- Cần: `OPENAI_API_KEY`

#### AI Job Matching (`/jobs`)
- Kiểm tra: `api/controllers/jobController.ts` hoặc `resumeController.ts`
- Endpoint: `POST /api/resumes/:id/analyze`
- Cần: `OPENAI_API_KEY`

### Bước 6: Debug Frontend

Mở Browser DevTools > Console:
- Tìm error messages liên quan đến OpenAI
- Kiểm tra network requests đến API endpoints
- Xem response từ server

---

## Vấn Đề Chung: Environment Variables Không Được Load

### Nguyên Nhân

1. **File `.env` ở sai vị trí:**
   - Phải ở root: `D:\CVmate\.env`
   - Hoặc ở `api/`: `D:\CVmate\api\.env`

2. **Server chưa restart sau khi thay đổi `.env`**

3. **Syntax error trong `.env`:**
   - Không có spaces quanh `=`
   - Không có quotes không cần thiết
   - Không có trailing spaces

### Giải Pháp

1. **Kiểm tra vị trí file:**
   ```bash
   # Windows
   dir .env
   dir api\.env
   ```

2. **Kiểm tra syntax:**
   ```env
   # ✅ ĐÚNG
   OPENAI_API_KEY=sk-abc123
   GOOGLE_CLIENT_ID=123.apps.googleusercontent.com
   
   # ❌ SAI
   OPENAI_API_KEY = sk-abc123  # Có spaces
   GOOGLE_CLIENT_ID="123.apps.googleusercontent.com"  # Quotes không cần thiết
   ```

3. **Restart server:**
   ```bash
   # Dừng server (Ctrl+C)
   # Khởi động lại
   cd api
   npm run dev
   ```

4. **Kiểm tra dotenv đã load:**
   - Trong `api/server.ts` và `api/app.ts` có `dotenv.config()`
   - Nếu vẫn không load, thử:
     ```typescript
     dotenv.config({ path: '.env' });
     dotenv.config({ path: './api/.env' });
     ```

---

## Checklist Khắc Phục Sự Cố

### Google OAuth
- [ ] `GOOGLE_CLIENT_ID` đã set trong `.env`
- [ ] `GOOGLE_CLIENT_SECRET` đã set trong `.env`
- [ ] `GOOGLE_CALLBACK_URL` khớp với Google Console
- [ ] `FRONTEND_URL` đúng với frontend đang chạy
- [ ] Google OAuth API đã được enable trong Google Console
- [ ] Authorized redirect URI đã được thêm vào Google Console
- [ ] Server đã được restart sau khi thay đổi `.env`
- [ ] Logs hiển thị `✅ Google OAuth strategy initialized`

### AI Features
- [ ] `OPENAI_API_KEY` đã set trong `.env`
- [ ] API key hợp lệ và chưa bị revoke
- [ ] OpenAI account có đủ credits/quota
- [ ] `OPENAI_MODEL` đã set (hoặc dùng default `gpt-3.5-turbo`)
- [ ] Server đã được restart sau khi thay đổi `.env`
- [ ] Test API key bằng curl hoặc Postman
- [ ] Kiểm tra logs khi sử dụng tính năng AI

### Environment Variables
- [ ] File `.env` ở đúng vị trí (root hoặc `api/`)
- [ ] Syntax `.env` đúng (không có spaces, quotes không cần thiết)
- [ ] Tất cả biến bắt buộc đã được set
- [ ] Server đã được restart
- [ ] Chạy `node api/scripts/check-env.js` để verify

---

## Liên Hệ Hỗ Trợ

Nếu vẫn gặp vấn đề sau khi thử các bước trên:

1. **Kiểm tra logs chi tiết:**
   - Server logs
   - Browser console
   - Network tab

2. **Cung cấp thông tin:**
   - OS và version
   - Node.js version
   - Error messages cụ thể
   - Output của `check-env.js`

3. **Test với minimal config:**
   - Chỉ set các biến bắt buộc
   - Test từng tính năng một
