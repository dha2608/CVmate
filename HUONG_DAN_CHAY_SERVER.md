# 🚀 Hướng Dẫn Chạy Server

## ⚡ Cách 1: Chạy Cùng Lúc (Khuyến Nghị)

**Chỉ cần 1 terminal**, chạy ở thư mục **root** (`D:\CVmate`):

```bash
npm run dev
```

Lệnh này sẽ tự động chạy:
- ✅ Frontend (Vite) → http://localhost:5173 hoặc 5174
- ✅ Backend (Node.js) → http://localhost:5001

**Ưu điểm:**
- ✅ Đơn giản, chỉ cần 1 lệnh
- ✅ Tự động restart khi có thay đổi code
- ✅ Logs của cả 2 được hiển thị cùng lúc

---

## 🔧 Cách 2: Chạy Riêng (Khi Cần Debug)

Nếu muốn chạy riêng để dễ xem logs hoặc debug:

### Terminal 1 - Frontend:
```bash
# Ở thư mục root (D:\CVmate)
npm run client:dev
```

### Terminal 2 - Backend:
```bash
# Ở thư mục root
npm run server:dev

# Hoặc vào thư mục api
cd api
npm run dev
```

**Khi nào nên dùng cách này:**
- 🔍 Cần xem logs riêng biệt
- 🐛 Debug một phần cụ thể
- ⚙️ Cần cấu hình riêng cho từng service

---

## 📋 Các Lệnh Khác

### Chỉ chạy Frontend:
```bash
npm run client:dev
```

### Chỉ chạy Backend:
```bash
npm run server:dev
```

### Build production:
```bash
npm run build
```

### Lint code:
```bash
npm run lint
```

---

## ⚠️ Lưu Ý

1. **Port đã được sử dụng:**
   - Nếu port 5001 bị chiếm: `node api/scripts/kill-port.js`
   - Nếu port 5173 bị chiếm: Vite tự động dùng port khác (5174, 5175...)

2. **Environment Variables:**
   - Đảm bảo file `.env` đã được cấu hình
   - Restart server sau khi thay đổi `.env`

3. **Database:**
   - Đảm bảo MongoDB đang chạy
   - Kiểm tra `MONGODB_URI` trong `.env`

---

## 🎯 Quick Start

```bash
# 1. Kiểm tra cấu hình
node api/scripts/check-env.js

# 2. Kill port nếu cần
node api/scripts/kill-port.js

# 3. Chạy server (1 lệnh cho cả 2)
npm run dev
```

Sau đó mở browser: http://localhost:5173 (hoặc port mà Vite hiển thị)
