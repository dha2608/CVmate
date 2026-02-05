# Quick Fix: Vercel Không Tự Động Deploy

## 🚀 Các Bước Kiểm Tra Nhanh

### 1. Kiểm tra Vercel Dashboard
1. Vào https://vercel.com/dashboard
2. Chọn project của bạn
3. Vào tab **Deployments**
4. Xem deployment gần nhất có lỗi không

### 2. Kiểm tra Settings → Git
1. Vào **Settings** → **Git**
2. Kiểm tra:
   - ✅ Repository: `dha2608/CVmate`
   - ✅ Production Branch: `main`
   - ✅ **Auto-deploy from Git**: Phải là **Enabled** (bật)

### 3. Kiểm tra Settings → General
1. Vào **Settings** → **General**
2. Kiểm tra:
   - **Root Directory**: `frontend` ⚠️ QUAN TRỌNG
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 4. Trigger Manual Deploy (Nhanh Nhất)
1. Vào tab **Deployments**
2. Click **...** (3 dots) trên deployment gần nhất
3. Chọn **Redeploy**
4. Hoặc click nút **Deploy** ở góc trên bên phải

### 5. Kiểm tra GitHub Webhook
1. Vào GitHub repo: https://github.com/dha2608/CVmate
2. Vào **Settings** → **Webhooks**
3. Kiểm tra có webhook từ Vercel không
4. Nếu không có → Vercel chưa được kết nối

## 🔧 Fix Ngay Lập Tức

### Option A: Reconnect Repository (Khuyến nghị)
1. Vercel Dashboard → **Settings** → **Git**
2. Click **Disconnect** repository
3. Click **Connect Git Repository**
4. Chọn lại `dha2608/CVmate`
5. Chọn branch `main`
6. Đảm bảo **Root Directory** = `frontend`
7. Click **Deploy**

### Option B: Deploy via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

### Option C: Check Build Logs
1. Vào deployment có vấn đề
2. Xem **Build Logs**
3. Tìm lỗi:
   - TypeScript errors → Fix và commit lại
   - Missing dependencies → Check package.json
   - Environment variables → Set trong Vercel Settings

## ⚙️ Cấu Hình Đúng

### Root Directory
```
frontend
```

### Build Command
```bash
npm run build
```

### Output Directory
```
dist
```

### Install Command
```bash
npm install
```

### Environment Variables (Settings → Environment Variables)
```
VITE_API_URL=https://cvmate-kf5p.onrender.com/api
```

## 📋 Checklist Nhanh

- [ ] Vercel Dashboard → Settings → Git → Auto-deploy: **Enabled**
- [ ] Root Directory = `frontend`
- [ ] Production Branch = `main`
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `dist`
- [ ] Environment Variables đã set
- [ ] Không có lỗi build trong logs

## 🎯 Action Items

1. **Ngay bây giờ**: Vào Vercel Dashboard và trigger manual deploy
2. **Kiểm tra**: Settings → Git → Auto-deploy phải bật
3. **Verify**: Root Directory = `frontend`
4. **Test**: Push một commit nhỏ và xem có auto-deploy không

## 💡 Lý Do Có Thể Không Auto-Deploy

1. **Auto-deploy bị tắt** → Bật lại trong Settings
2. **Root Directory sai** → Set = `frontend`
3. **Webhook bị lỗi** → Reconnect repository
4. **Build failed** → Fix lỗi và commit lại
5. **Branch không đúng** → Đảm bảo push vào `main`

## 🔄 Test Auto-Deploy

Sau khi fix, test bằng cách:
1. Tạo một file test nhỏ
2. Commit và push
3. Xem Vercel có tự động deploy không

```bash
# Test commit
echo "test" > frontend/test.txt
git add frontend/test.txt
git commit -m "test: verify auto-deploy"
git push origin main
```

Nếu Vercel tự động deploy → ✅ Fixed!
Nếu không → Kiểm tra lại các bước trên.
