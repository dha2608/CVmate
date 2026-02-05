# ✅ Deployment Checklist

Checklist để đảm bảo deploy thành công.

---

## 🔴 Pre-Deploy (Trước khi deploy)

### Code
- [ ] Code đã được test local
- [ ] Không có lỗi TypeScript (`npm run check`)
- [ ] Không có lỗi lint (`npm run lint`)
- [ ] Build thành công (`npm run build`)

### Git
- [ ] Đã commit tất cả changes
- [ ] Đã push lên GitHub
- [ ] Branch `main` là branch chính

---

## 🟢 Vercel (Frontend)

### Project Setup
- [ ] Đã tạo project trên Vercel
- [ ] Connected GitHub repo
- [ ] Root Directory = `frontend`
- [ ] Framework = Vite
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `dist`

### Environment Variables
- [ ] `VITE_API_URL` = `https://cvmate-kf5p.onrender.com/api`

### Deploy
- [ ] Deploy thành công
- [ ] URL frontend hoạt động
- [ ] Không có lỗi trong build logs

---

## 🔵 Render (Backend)

### Service Setup
- [ ] Đã tạo Web Service trên Render
- [ ] Connected GitHub repo
- [ ] Root Directory = `api`
- [ ] Build Command = `npm install`
- [ ] Start Command = `npx tsx -r dotenv/config server.ts`

### Environment Variables
- [ ] `MONGO_URI` = MongoDB Atlas connection string
- [ ] `JWT_SECRET` = Secret key (min 32 chars)
- [ ] `FRONTEND_URL` = `https://c-vmate-hu48.vercel.app`
- [ ] `SESSION_SECRET` = Session secret (optional)
- [ ] `GOOGLE_CLIENT_ID` = Google OAuth ID (optional)
- [ ] `GOOGLE_CLIENT_SECRET` = Google OAuth secret (optional)
- [ ] `HF_API_KEY` = Hugging Face API key (optional)

### Deploy
- [ ] Deploy thành công
- [ ] Service status = "Live"
- [ ] Health check trả về `success: true`

---

## 🟡 MongoDB Atlas

### Setup
- [ ] Đã tạo cluster
- [ ] Đã tạo database user
- [ ] Network Access đã allow `0.0.0.0/0` (hoặc Render IPs)
- [ ] Connection string đã được test

### Connection
- [ ] Render có thể connect đến Atlas
- [ ] Health check shows `database: "connected"`

---

## 🧪 Post-Deploy Testing

### Frontend
- [ ] Trang chủ load được
- [ ] Login page hoạt động
- [ ] Register page hoạt động
- [ ] Không có CORS errors trong Console

### Backend
- [ ] Health endpoint: `/api/health` trả về OK
- [ ] Login endpoint: `/api/auth/login` hoạt động
- [ ] Register endpoint: `/api/auth/register` hoạt động

### Integration
- [ ] Frontend có thể login thành công
- [ ] Frontend có thể register thành công
- [ ] API calls từ frontend đến backend thành công
- [ ] Không có lỗi trong browser Console
- [ ] Không có lỗi trong Render logs

---

## 📊 Monitoring

### Logs
- [ ] Vercel build logs không có errors
- [ ] Render deploy logs không có errors
- [ ] Render runtime logs không có errors

### Performance
- [ ] Frontend load time < 3s
- [ ] API response time < 500ms
- [ ] Database queries < 200ms

---

## 🔐 Security

### Environment Variables
- [ ] Không có secrets trong code
- [ ] `.env` files đã được gitignore
- [ ] Production secrets khác với dev secrets

### CORS
- [ ] CORS chỉ allow frontend domain
- [ ] Không có wildcard `*` trong production

### Headers
- [ ] Security headers đã được set (helmet.js)
- [ ] HTTPS được enforce

---

## ✅ Final Verification

- [ ] Tất cả features hoạt động
- [ ] Không có critical errors
- [ ] Performance acceptable
- [ ] Security measures in place

---

**Sau khi hoàn thành checklist này, app đã sẵn sàng cho production!** 🎉
