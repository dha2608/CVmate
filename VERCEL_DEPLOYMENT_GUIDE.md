# Vercel Deployment Guide - Troubleshooting Auto-Deploy

## 🔍 Kiểm tra Auto-Deploy

### 1. Kiểm tra GitHub Integration
1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project của bạn
3. Vào **Settings** → **Git**
4. Kiểm tra:
   - ✅ Repository được kết nối đúng
   - ✅ Production Branch: `main` (hoặc `master`)
   - ✅ Auto-deploy từ Git: **Enabled**

### 2. Kiểm tra Build Settings
1. Vào **Settings** → **General**
2. Kiểm tra:
   - **Root Directory**: `frontend` (nếu monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Kiểm tra Environment Variables
1. Vào **Settings** → **Environment Variables**
2. Đảm bảo có các biến:
   - `VITE_API_URL` - URL của backend API
   - Các biến khác nếu cần

### 4. Kiểm tra Recent Deployments
1. Vào tab **Deployments**
2. Xem deployment gần nhất:
   - Nếu có lỗi → Xem logs
   - Nếu thành công nhưng không auto-deploy → Kiểm tra webhook

### 5. Kiểm tra Webhook
1. Vào **Settings** → **Git**
2. Scroll xuống **Deploy Hooks**
3. Kiểm tra webhook URL có hoạt động không

## 🔧 Cách Fix

### Option 1: Trigger Manual Deploy
1. Vào Vercel Dashboard
2. Click **Deployments** tab
3. Click **...** (3 dots) trên deployment gần nhất
4. Chọn **Redeploy**

### Option 2: Reconnect GitHub
1. Vào **Settings** → **Git**
2. Click **Disconnect** repository
3. Click **Connect Git Repository**
4. Chọn lại repository và branch

### Option 3: Check Build Logs
1. Vào deployment có vấn đề
2. Xem **Build Logs**
3. Tìm lỗi và fix:
   - TypeScript errors
   - Missing dependencies
   - Environment variables

### Option 4: Force Deploy via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

## 📋 Checklist

- [ ] GitHub repo được kết nối với Vercel
- [ ] Auto-deploy enabled trong Vercel settings
- [ ] Root Directory đúng (`frontend` nếu monorepo)
- [ ] Build Command đúng (`npm run build`)
- [ ] Environment variables được set
- [ ] Không có lỗi build trong logs
- [ ] Branch `main` được track

## 🚨 Common Issues

### Issue 1: "Build failed"
**Solution**: Xem build logs, fix TypeScript errors hoặc missing dependencies

### Issue 2: "No deployments triggered"
**Solution**: 
- Kiểm tra GitHub webhook
- Reconnect repository
- Trigger manual deploy

### Issue 3: "Environment variables missing"
**Solution**: Thêm các biến cần thiết trong Vercel Settings

### Issue 4: "Wrong root directory"
**Solution**: Set Root Directory = `frontend` trong Vercel Settings

## 📝 Current Configuration

### Root Directory
```
frontend/
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

### Environment Variables Needed
```
VITE_API_URL=https://cvmate-kf5p.onrender.com/api
```

## 🔄 Force Deploy Script

Nếu cần, có thể tạo GitHub Action để force deploy:

```yaml
# .github/workflows/vercel-deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

## 📞 Next Steps

1. Kiểm tra Vercel Dashboard
2. Xem deployment logs
3. Kiểm tra GitHub webhook
4. Nếu cần, trigger manual deploy
5. Hoặc reconnect repository
