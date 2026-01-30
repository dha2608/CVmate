# Hướng Dẫn Cấu Hình OpenAI API Key

## Vấn Đề

Nếu bạn gặp lỗi `503 Service Unavailable` khi sử dụng các tính năng AI (AI Enhance, Interview Simulator, ATS Checker), điều này có nghĩa là OpenAI API key chưa được cấu hình hoặc không hợp lệ.

## Giải Pháp

### 1. Lấy OpenAI API Key

1. Truy cập https://platform.openai.com/
2. Đăng ký/Đăng nhập tài khoản
3. Vào **API Keys** section
4. Click **Create new secret key**
5. Copy API key (chỉ hiển thị 1 lần, lưu lại cẩn thận)

### 2. Cấu Hình trong Project

Thêm vào file `.env` trong thư mục root:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

**Lưu ý:**
- Thay `sk-your-actual-api-key-here` bằng API key thật của bạn
- Model mặc định là `gpt-3.5-turbo` (rẻ hơn)
- Có thể dùng `gpt-4o-mini` hoặc `gpt-4` nếu muốn

### 3. Restart Server

Sau khi thêm API key, restart server:

```bash
# Dừng server (Ctrl+C)
# Sau đó chạy lại
npm run dev
```

### 4. Kiểm Tra

Sau khi restart, thử lại các tính năng AI:
- **AI Enhance** trong CV Builder
- **Interview Simulator**
- **ATS Checker**

## Các Lỗi Thường Gặp

### Lỗi 401: Invalid API Key
- **Nguyên nhân:** API key không đúng hoặc đã bị revoke
- **Giải pháp:** Tạo API key mới và cập nhật trong `.env`

### Lỗi 429: Rate Limit Exceeded
- **Nguyên nhân:** Đã vượt quá giới hạn request
- **Giải pháp:** Đợi một lúc rồi thử lại, hoặc nâng cấp plan

### Lỗi 503: Service Unavailable
- **Nguyên nhân:** API key chưa được cấu hình
- **Giải pháp:** Thêm `OPENAI_API_KEY` vào file `.env`

## Chi Phí

- **gpt-3.5-turbo:** ~$0.0015 per 1K tokens (rất rẻ)
- **gpt-4o-mini:** ~$0.15 per 1M input tokens
- **gpt-4:** ~$30 per 1M input tokens (đắt hơn nhiều)

**Khuyến nghị:** Dùng `gpt-3.5-turbo` cho development và testing.

## Bảo Mật

⚠️ **QUAN TRỌNG:**
- **KHÔNG** commit file `.env` lên Git
- **KHÔNG** chia sẻ API key công khai
- File `.env` đã được thêm vào `.gitignore`

## Troubleshooting

Nếu vẫn gặp lỗi sau khi cấu hình:

1. Kiểm tra file `.env` có đúng format không
2. Kiểm tra API key có còn valid không (vào OpenAI dashboard)
3. Kiểm tra billing/quota của tài khoản OpenAI
4. Xem logs trong terminal để biết lỗi cụ thể
