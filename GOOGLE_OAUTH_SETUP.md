# Google OAuth Setup Guide

## Vấn đề: Error 400: redirect_uri_mismatch

Lỗi này xảy ra khi `redirect_uri` trong request không khớp với URI đã đăng ký trong Google Cloud Console.

## Cách sửa:

### 1. Xác định Callback URL đúng

Backend sẽ sử dụng callback URL theo thứ tự ưu tiên:
1. `GOOGLE_CALLBACK_URL` (nếu được set trong environment variables)
2. `${BACKEND_URL}/api/auth/google/callback` (tự động tạo từ BACKEND_URL)

### 2. Cấu hình Environment Variables

Đảm bảo các biến sau được set đúng:

```bash
# Backend URL (không có trailing slash)
BACKEND_URL=https://your-backend-domain.com
# HOẶC
GOOGLE_BACKEND_URL=https://your-backend-domain.com

# Callback URL (phải là full URL, không phải relative path)
GOOGLE_CALLBACK_URL=https://your-backend-domain.com/api/auth/google/callback

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 3. Đăng ký trong Google Cloud Console

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project của bạn
3. Đi tới **APIs & Services** > **Credentials**
4. Chọn OAuth 2.0 Client ID của bạn
5. Trong **Authorized redirect URIs**, thêm:
   ```
   https://your-backend-domain.com/api/auth/google/callback
   ```
   ⚠️ **QUAN TRỌNG**: URL phải khớp CHÍNH XÁC với `GOOGLE_CALLBACK_URL` hoặc URL tự động tạo

### 4. Kiểm tra logs

Backend sẽ log thông tin cấu hình khi khởi động:
```
🔐 Google OAuth Configuration: {
  backendBaseUrl: 'https://your-backend-domain.com',
  resolvedCallbackUrl: 'https://your-backend-domain.com/api/auth/google/callback',
  hasClientId: true,
  hasClientSecret: true
}
```

### 5. Lưu ý

- **Không dùng trailing slash**: `https://domain.com/api/auth/google/callback` ✅ (đúng), `https://domain.com/api/auth/google/callback/` ❌ (sai)
- **Phải là HTTPS** trong production (trừ localhost)
- **URL phải khớp chính xác** giữa Google Console và environment variable
- Sau khi thay đổi trong Google Console, có thể mất vài phút để có hiệu lực

### 6. Test local

Để test local, sử dụng:
```bash
BACKEND_URL=http://localhost:5001
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
```

Và thêm `http://localhost:5001/api/auth/google/callback` vào Google Console (chỉ dùng cho development).
