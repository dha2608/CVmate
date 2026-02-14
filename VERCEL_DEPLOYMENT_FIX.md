# Vercel 部署错误修复

## 📅 修复日期
当前时间

---

## 🐛 问题描述

### 1. **"Unexpected token '<'" 错误**
**错误信息**:
```
Uncaught SyntaxError: Unexpected token '<'
react-vendor.vtzNS8DM.js:17
```

**原因**: 
- `vercel.json` 中的 rewrites 规则 `"source": "/(.*)"` 匹配了所有路径
- 这导致 `/assets/*.js` 文件也被重定向到 `/index.html`
- 浏览器尝试加载 JS 文件时收到 HTML 内容，导致语法错误

### 2. **Sentry DSN 未配置警告**
**警告信息**:
```
[Error Tracking] Sentry DSN not configured, using console logging
```

**说明**: 这是正常的，当 Sentry DSN 未配置时，系统会回退到 console logging。这不是错误。

### 3. **`/api/achievements` 404 错误**
**说明**: 这是可选功能，前端已使用 `Promise.allSettled` 处理，不会影响应用功能。

---

## ✅ 修复方案

### 修复 `vercel.json` rewrites 规则

**修复前**:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**修复后**:
```json
{
  "rewrites": [
    {
      "source": "/((?!assets|api|uploads|logo\\.svg|favicon\\.svg).*)",
      "destination": "/index.html"
    }
  ]
}
```

**说明**:
- 使用负向前瞻正则表达式 `(?!...)` 排除以下路径：
  - `/assets/*` - 静态资源（JS, CSS, 图片等）
  - `/api/*` - API 路由
  - `/uploads/*` - 上传的文件
  - `logo.svg`, `favicon.svg` - 静态图标文件
- 只有 SPA 路由会被重定向到 `index.html`

---

## 📋 其他说明

### Sentry 配置（可选）

如果需要启用 Sentry 错误跟踪，需要：

1. 在 Vercel 环境变量中添加 `VITE_SENTRY_DSN`
2. 或者在 `.env` 文件中添加：
   ```
   VITE_SENTRY_DSN=your_sentry_dsn_here
   ```

### `/api/achievements` 404

这是可选功能，如果后端未实现此端点，前端会静默处理，不影响其他功能。

---

## 🚀 部署后验证

修复后，请验证：

1. ✅ JavaScript 文件正确加载（检查 Network 标签）
2. ✅ 页面路由正常工作
3. ✅ 静态资源（图片、CSS）正确加载
4. ✅ API 请求正常工作

---

## 📝 技术细节

### Vercel Rewrites 规则

Vercel 的 rewrites 规则使用正则表达式匹配：
- `(.*)` - 匹配所有路径
- `((?!...).*)` - 负向前瞻，排除特定路径

### 静态资源路径

构建后的静态资源位于 `/assets/` 目录：
- JS 文件: `/assets/[name].[hash].js`
- CSS 文件: `/assets/[name].[hash].css`
- 其他资源: `/assets/[name].[hash].[ext]`

这些路径必须不被 rewrites 规则捕获，否则会被重定向到 `index.html`。

---

**修复完成！现在可以正常部署到 Vercel 了。** 🎉
