# Fix: Vercel Deployment Limit (100/day)

## 🚨 Vấn Đề

Vercel Free Plan chỉ cho phép **100 deployments mỗi ngày**. Bạn đã vượt quá giới hạn này.

## 🔍 Nguyên Nhân

1. **Quá nhiều commits** → Mỗi commit trigger một deployment
2. **Build failed và retry** → Mỗi lần retry tính là 1 deployment
3. **Manual redeploy nhiều lần** → Mỗi lần redeploy tính là 1 deployment
4. **Preview deployments** → Mỗi PR/commit tạo preview deployment

## ✅ Giải Pháp

### 1. Đợi 8 Giờ (Tạm Thời)
- Vercel sẽ reset limit sau 8 giờ
- Trong thời gian này, không thể deploy mới

### 2. Tối Ưu Deployments (Lâu Dài)

#### A. Giảm Số Lần Commit
- **Gộp nhiều thay đổi nhỏ thành 1 commit**
- Sử dụng `git commit --amend` cho các fix nhỏ
- Chỉ push khi có thay đổi quan trọng

#### B. Sử dụng Build Filters
Tạo file `.vercelignore` hoặc cấu hình trong Vercel để bỏ qua các thay đổi không cần deploy:

```json
// .vercelignore (hoặc trong Vercel Settings → Git → Build Filters)
README.md
*.md
docs/
.gitignore
```

#### C. Disable Preview Deployments (Nếu Không Cần)
1. Vào Vercel Dashboard
2. **Settings** → **Git**
3. Tắt **"Automatic Preview Deployments"** (nếu không cần)

#### D. Chỉ Deploy Production Branch
1. **Settings** → **Git**
2. Chỉ enable auto-deploy cho branch `main`
3. Disable preview deployments cho các branch khác

### 3. Upgrade Plan (Nếu Cần)
- **Pro Plan**: $20/tháng → Unlimited deployments
- **Team Plan**: $20/user/tháng → Unlimited deployments

### 4. Sử Dụng GitHub Actions (Alternative)
Thay vì auto-deploy, có thể dùng GitHub Actions để deploy chỉ khi cần:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
  workflow_dispatch: # Manual trigger

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
          vercel-args: '--prod'
          working-directory: ./frontend
```

## 📋 Best Practices

### 1. Commit Strategy
```bash
# ❌ BAD: Nhiều commits nhỏ
git commit -m "fix typo"
git commit -m "fix another typo"
git commit -m "update readme"
git push

# ✅ GOOD: Gộp thành 1 commit
git commit -m "fix: typos and update readme"
git push
```

### 2. Sử Dụng `--amend` Cho Fix Nhỏ
```bash
# Fix lỗi nhỏ, không cần commit mới
git add .
git commit --amend --no-edit
git push --force-with-lease
```

### 3. Batch Changes
```bash
# Làm nhiều thay đổi, commit 1 lần
git add .
git commit -m "feat: multiple improvements"
git push
```

### 4. Sử Dụng Draft PRs
- Tạo Draft PR để test
- Chỉ merge khi hoàn thành → 1 deployment thay vì nhiều

## 🎯 Action Plan

### Ngay Bây Giờ
1. ✅ **Đợi 8 giờ** để reset limit
2. ✅ **Kiểm tra** số deployments trong Vercel Dashboard
3. ✅ **Review** các deployments không cần thiết

### Sau 8 Giờ
1. ✅ **Tối ưu commit strategy** - gộp nhiều thay đổi
2. ✅ **Disable preview deployments** nếu không cần
3. ✅ **Sử dụng build filters** để bỏ qua thay đổi không quan trọng
4. ✅ **Chỉ deploy production** khi cần

### Lâu Dài
1. ✅ **Upgrade plan** nếu cần nhiều deployments
2. ✅ **Sử dụng GitHub Actions** để control tốt hơn
3. ✅ **Monitor** số deployments mỗi ngày

## 📊 Monitor Deployments

### Xem Số Deployments
1. Vercel Dashboard → **Deployments**
2. Filter theo ngày
3. Đếm số deployments

### Giới Hạn
- **Free Plan**: 100 deployments/ngày
- **Pro Plan**: Unlimited
- **Team Plan**: Unlimited

## 🔧 Cấu Hình Tối Ưu

### 1. Build Filters (Vercel Settings)
```
# Ignore các file không cần deploy
*.md
docs/
.gitignore
README.md
```

### 2. Chỉ Deploy Production
- **Settings** → **Git**
- **Production Branch**: `main` only
- **Preview Deployments**: Disable (nếu không cần)

### 3. Environment-Specific Deployments
- Chỉ deploy khi có thay đổi trong `frontend/`
- Ignore thay đổi trong `api/`, `docs/`, etc.

## 💡 Tips

1. **Gộp commits** trước khi push
2. **Sử dụng `--amend`** cho fix nhỏ
3. **Disable preview** nếu không cần
4. **Monitor** số deployments
5. **Upgrade** nếu thường xuyên vượt limit

## 🚀 Quick Fix

### Option 1: Đợi Reset (8 giờ)
- Đơn giản nhất
- Không tốn phí
- Nhưng phải đợi

### Option 2: Upgrade Plan
- Pro Plan: $20/tháng
- Unlimited deployments
- Nhiều features khác

### Option 3: Optimize Workflow
- Gộp commits
- Disable preview
- Sử dụng build filters
- Miễn phí nhưng cần thay đổi workflow

## 📝 Checklist

- [ ] Đợi 8 giờ để reset limit
- [ ] Review số deployments trong ngày
- [ ] Tối ưu commit strategy
- [ ] Disable preview deployments (nếu không cần)
- [ ] Sử dụng build filters
- [ ] Chỉ deploy production branch
- [ ] Consider upgrade plan (nếu cần)
