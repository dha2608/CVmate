# 🚀 CVmate - Hướng Dẫn Deploy

Tài liệu này hướng dẫn deploy CVmate lên **Vercel (Frontend)** và **Render (Backend)**.

---

## 📋 Tổng Quan Kiến Trúc

```
CVmate/
├── frontend/          # React + Vite → Deploy trên Vercel
│   └── src/
├── api/               # Node.js + Express → Deploy trên Render
│   └── server.ts
└── package.json       # Root dependencies (cho dev)
```

**URLs Production:**
- Frontend: `https://c-vmate-hu48.vercel.app`
- Backend: `https://cvmate-kf5p.onrender.com`

---

## 🎯 Frontend - Vercel Deployment

### 1. Cấu Hình Vercel

**Project Settings:**
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2. Environment Variables (Vercel)

Vào **Settings → Environment Variables**, thêm:

```env
VITE_API_URL=https://cvmate-kf5p.onrender.com/api
```

**Lưu ý**: Phải có `/api` ở cuối URL.

### 3. Auto Deploy

- Mỗi lần push lên `main` branch → Vercel tự động deploy
- Preview deployments cho mỗi PR

---

## 🔧 Backend - Render Deployment

### 1. Tạo Web Service trên Render

1. Vào [Render Dashboard](https://dashboard.render.com)
2. **New → Web Service**
3. Connect GitHub repo: `dha2608/CVmate`

### 2. Cấu Hình Render

**Settings:**
- **Name**: `cvmate-api` (hoặc tên bạn muốn)
- **Region**: `Oregon (US West)` (hoặc gần nhất)
- **Branch**: `main`
- **Root Directory**: `api` ⚠️ **QUAN TRỌNG**
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npx tsx -r dotenv/config server.ts`

### 3. Environment Variables (Render)

Vào **Environment** tab, thêm các biến sau:

#### Required (Bắt buộc)
```env
# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/cvmate?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Frontend URL (cho CORS)
FRONTEND_URL=https://c-vmate-hu48.vercel.app
```

#### Optional (Tùy chọn - cho các tính năng)
```env
# Session (cho OAuth)
SESSION_SECRET=your-session-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://cvmate-kf5p.onrender.com/api/auth/google/callback

# AI (Hugging Face)
HF_API_KEY=your-huggingface-api-token
HF_CHAT_MODEL=meta-llama/Meta-Llama-3-8B-Instruct

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret

# News API (optional)
NEWS_API_KEY=your-news-api-key
```

### 4. Auto Deploy

- **Auto Deploy**: `Yes` (on push to main)
- Mỗi lần push code lên `main` → Render tự động rebuild và deploy

---

## 🔐 MongoDB Atlas Setup

### 1. Tạo Cluster

1. Vào [MongoDB Atlas](https://cloud.mongodb.com)
2. Tạo **Free Cluster (M0)**
3. Chọn region gần Render (US West)

### 2. Network Access

1. Vào **Network Access**
2. **Add IP Address** → Chọn **Allow Access from Anywhere** (`0.0.0.0/0`)
   - ⚠️ Production nên restrict IPs, nhưng dev có thể dùng `0.0.0.0/0`

### 3. Database User

1. Vào **Database Access**
2. **Add Database User**
3. Tạo username/password (lưu lại để dùng trong connection string)

### 4. Connection String

1. Vào **Database → Connect → Drivers**
2. Copy connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/cvmate?retryWrites=true&w=majority
   ```
3. Thay `<username>` và `<password>` bằng credentials vừa tạo
4. Paste vào `MONGO_URI` trên Render

---

## ✅ Kiểm Tra Deploy

### 1. Backend Health Check

Mở browser, vào:
```
https://cvmate-kf5p.onrender.com/api/health
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "status": "ok",
  "database": "connected",
  ...
}
```

### 2. Frontend

Mở browser, vào:
```
https://c-vmate-hu48.vercel.app
```

**Kiểm tra:**
- ✅ Trang load được
- ✅ Không có lỗi CORS trong Console
- ✅ Login/Register hoạt động
- ✅ API calls thành công

### 3. Test End-to-End

1. **Register** một account mới
2. **Login** với account đó
3. **Tạo CV** trong Builder
4. **Browse Jobs**
5. **Test Interview** (nếu có HF_API_KEY)

---

## 🔄 Workflow Deploy

### Development
```bash
# Local development
cd D:\CVmate
npm run dev  # Chạy cả frontend và backend
```

### Deploy
```bash
# 1. Commit changes
git add .
git commit -m "your changes"
git push origin main

# 2. Vercel tự động deploy frontend (1-2 phút)
# 3. Render tự động deploy backend (2-3 phút)
```

---

## 🐛 Troubleshooting

### Backend không start được

**Kiểm tra:**
1. Root Directory trên Render = `api` ✅
2. Start Command = `npx tsx -r dotenv/config server.ts` ✅
3. Environment variables đã set đầy đủ ✅
4. MongoDB Atlas IP whitelist đã allow `0.0.0.0/0` ✅

**Xem logs:**
- Render → Service → Logs tab

### Frontend không connect được backend

**Kiểm tra:**
1. `VITE_API_URL` trên Vercel = `https://cvmate-kf5p.onrender.com/api` ✅
2. `FRONTEND_URL` trên Render = `https://c-vmate-hu48.vercel.app` ✅
3. Backend health check trả về `success: true` ✅

**Xem Console:**
- F12 → Console tab → xem có CORS errors không

### MongoDB connection failed

**Kiểm tra:**
1. Connection string đúng format
2. Username/password đúng
3. IP whitelist đã allow
4. Cluster đang running (không bị pause)

---

## 📝 Environment Variables Checklist

### Vercel (Frontend)
- [ ] `VITE_API_URL` = `https://cvmate-kf5p.onrender.com/api`

### Render (Backend)
- [ ] `MONGO_URI` = `mongodb+srv://...`
- [ ] `JWT_SECRET` = `...` (min 32 chars)
- [ ] `FRONTEND_URL` = `https://c-vmate-hu48.vercel.app`
- [ ] `SESSION_SECRET` = `...` (optional)
- [ ] `GOOGLE_CLIENT_ID` = `...` (optional)
- [ ] `GOOGLE_CLIENT_SECRET` = `...` (optional)
- [ ] `HF_API_KEY` = `...` (optional)
- [ ] `STRIPE_SECRET_KEY` = `...` (optional)

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Frontend URL**: https://c-vmate-hu48.vercel.app
- **Backend URL**: https://cvmate-kf5p.onrender.com
- **Backend Health**: https://cvmate-kf5p.onrender.com/api/health

---

## 📚 Next Steps

Sau khi deploy thành công:
1. ✅ Test tất cả features
2. ✅ Setup monitoring (Sentry, etc.)
3. ✅ Setup CI/CD pipeline
4. ✅ Add custom domain (nếu cần)
5. ✅ Setup backup strategy cho MongoDB

---

**Last Updated**: 2026-02-04
