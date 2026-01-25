# 🚀 Hướng Dẫn Chạy CVmate (Frontend + Backend)

## 📋 Yêu Cầu Trước Khi Bắt Đầu

✅ **Node.js** phiên bản 16+ đã cài (kiểm tra: `node -v`)
✅ **npm** hoặc **yarn** (kiểm tra: `npm -v`)
✅ **.env** file đã setup (nếu cần API keys)
✅ **MongoDB** đang chạy (local hoặc cloud)

---

## 🛠️ 1️⃣ Cài Đặt Dependencies

Chạy lệnh này **một lần duy nhất** khi clone project:

```bash
npm install
```

Điều này sẽ cài tất cả packages cần thiết cho cả **frontend** lẫn **backend**.

---

## ▶️ 2️⃣ Chạy Project

### **Option A: Chạy Cả Frontend + Backend (Khuyên Dùng)**

```bash
npm run dev
```

✅ Cái này sẽ **tự động khởi động cả hai**:
- **Frontend** (Vite) trên `http://localhost:5173`
- **Backend** (Express) trên `http://localhost:5000` (hoặc port trong `.env`)

📌 **Nhìn terminal** - sẽ thấy cả 2 server start up cùng lúc.

---

### **Option B: Chạy Riêng Lẻ (Nếu Cần Debug)**

#### 🎨 Chỉ Frontend:
```bash
npm run client:dev
```
- Frontend sẽ chạy trên `http://localhost:5173`
- **Lưu ý:** Backend cần chạy ở terminal khác

#### 🔥 Chỉ Backend:
```bash
npm run server:dev
```
- Backend sẽ chạy trên `http://localhost:5000`
- **Auto-reload** khi bạn sửa file (nodemon)

---

## 📝 3️⃣ Setup Environment Variables

Tạo file `.env` ở **root project** (cùng cấp package.json):

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/cvmate
# Hoặc dùng MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cvmate

# OpenAI API
OPENAI_API_KEY=sk-your-api-key-here

# JWT Secret
JWT_SECRET=your-secret-key-here

# Port Backend (optional)
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

📌 **Không commit `.env`** - file này chứa secrets!

---

## ✅ 4️⃣ Kiểm Tra Setup

Sau khi start server, kiểm tra:

### ✔️ Frontend Hoạt Động:
```
Mở browser: http://localhost:5173
- Nên thấy trang Home
- Có thể điều hướng đến các page khác
```

### ✔️ Backend Hoạt Động:
```bash
# Mở terminal mới, chạy:
curl http://localhost:5000/api/health

# Hoặc dùng Postman/Thunder Client
GET http://localhost:5000/api/health
```

---

## 🔄 5️⃣ Workflow Phát Triển

### Khi **sửa code Backend**:
```
1. Sửa file trong /api
2. Nodemon tự động restart server
3. Refresh frontend (Ctrl+R) nếu cần test
```

### Khi **sửa code Frontend**:
```
1. Sửa file trong /src
2. Vite tự động hot-reload
3. Browser tự update ngay lập tức
```

---

## 🐛 Troubleshooting

### ❌ **Port 5173 hoặc 5000 đang bận**

**Giải pháp 1:** Kill process đang chiếm port
```powershell
# Tìm process trên port 5000 (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# Kill process
Stop-Process -Id <PID> -Force
```

**Giải pháp 2:** Đổi port trong `vite.config.ts` (frontend) hoặc `.env` (backend)

---

### ❌ **"ECONNREFUSED" - Backend không kết nối được**

**Nguyên nhân:** Backend chưa chạy hoặc port sai

**Giải pháp:**
```bash
# Bật backend ở terminal khác
npm run server:dev

# Hoặc kiểm tra .env - PORT phải match
```

---

### ❌ **MongoDB connection error**

**Giải pháp:**
```bash
# Nếu dùng local MongoDB, ensure mongod đang chạy:
mongod

# Hoặc update MONGODB_URI trong .env
# Dùng MongoDB Atlas (cloud):
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/cvmate
```

---

### ❌ **Dependencies conflict**

**Giải pháp:**
```bash
# Xóa node_modules + lock file
rm -r node_modules package-lock.json  # Linux/Mac
rmdir /s node_modules  # Windows

# Cài lại
npm install
```

---

## 📚 Build & Deploy

### 🏗️ Build cho Production:
```bash
npm run build
```
- Tạo `/dist` folder (frontend)
- TypeScript compile thành JavaScript

### 🚀 Preview Production Build:
```bash
npm run preview
```
- Xem kết quả build trước khi deploy
- Chạy trên `http://localhost:4173`

---

## 📊 Các Script Khác

| Script | Mục đích |
|--------|---------|
| `npm run dev` | 🔥 Chạy cả frontend + backend (KHUYÊN DÙNG) |
| `npm run client:dev` | Chỉ frontend |
| `npm run server:dev` | Chỉ backend |
| `npm run build` | Build production |
| `npm run preview` | Xem build production |
| `npm run lint` | Kiểm tra code quality |
| `npm run check` | Type check TypeScript |

---

## 🎯 First Steps (Sau khi start server)

1. ✅ Mở `http://localhost:5173` → thấy trang Home
2. ✅ Thử click "Register" → tạo account mới
3. ✅ Đăng nhập → vào Dashboard
4. ✅ Thử tạo CV ở Builder
5. ✅ Thử Interview Simulator

---

## 📞 Cần Giúp?

Nếu gặp lỗi:
1. **Kiểm tra console** (browser DevTools + terminal)
2. **Check `.env`** có đủ config không
3. **Xem logs** của backend + frontend
4. **Tham khảo PROJECT_STRUCTURE.md** để hiểu cách code organize

---

**Happy Coding! 🚀**
