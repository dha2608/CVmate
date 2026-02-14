# Sentry 错误追踪设置指南

## 概述

项目已集成 Sentry 错误追踪服务。Sentry 是可选的，如果未配置 DSN，系统将自动回退到控制台日志记录。

## 设置步骤

### 1. 创建 Sentry 账户

1. 访问 [https://sentry.io](https://sentry.io)
2. 注册或登录账户
3. 创建一个新项目
4. 选择 "React" 作为平台

### 2. 获取 DSN

1. 在 Sentry 项目设置中找到 DSN
2. DSN 格式类似: `https://xxxxx@sentry.io/xxxxx`

### 3. 配置环境变量

#### 开发环境

在 `frontend/.env.local` 文件中添加:

```env
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

#### 生产环境 (Vercel)

1. 进入 Vercel 项目设置
2. 导航到 "Environment Variables"
3. 添加新变量:
   - **Name**: `VITE_SENTRY_DSN`
   - **Value**: 你的 Sentry DSN
   - **Environment**: Production, Preview, Development

### 4. 安装依赖 (如果需要)

如果使用 Sentry，需要安装依赖:

```bash
cd frontend
npm install @sentry/react
```

注意: 代码使用动态导入，即使未安装 Sentry 也不会报错。

## 功能特性

### 自动错误追踪

- ✅ React Error Boundaries 自动捕获错误
- ✅ 未处理的异常自动上报
- ✅ 用户上下文信息自动关联

### 性能监控

- ✅ 页面加载性能追踪
- ✅ API 请求性能监控
- ✅ 用户交互追踪

### Session Replay

- ✅ 错误发生时的会话回放
- ✅ 用户操作记录
- ✅ 隐私保护 (自动屏蔽敏感信息)

## 配置选项

错误追踪服务在 `frontend/src/lib/errorTracking.ts` 中配置。

### 过滤错误

默认过滤以下错误类型:
- 网络错误 (Failed to fetch)
- CORS 错误
- 预期的超时错误

### 采样率

- **开发环境**: 100% 采样
- **生产环境**: 10% 采样 (可调整)

### 用户上下文

用户登录时自动设置:
- User ID
- Email
- Username

## 查看错误

1. 登录 Sentry 仪表板
2. 导航到你的项目
3. 查看 "Issues" 标签页
4. 点击错误查看详细信息

## 故障排除

### Sentry 未初始化

如果看到控制台消息 "Sentry DSN not configured"，这是正常的。系统会自动回退到控制台日志。

### 错误未上报

检查:
1. DSN 是否正确配置
2. 网络连接是否正常
3. Sentry 项目是否激活
4. 浏览器控制台是否有错误

## 隐私和合规

- ✅ 自动屏蔽敏感信息
- ✅ Session Replay 自动屏蔽文本和媒体
- ✅ 符合 GDPR 要求
- ✅ 用户可以选择退出

## 支持

如有问题，请查看:
- [Sentry 文档](https://docs.sentry.io/platforms/javascript/guides/react/)
- 项目代码: `frontend/src/lib/errorTracking.ts`
