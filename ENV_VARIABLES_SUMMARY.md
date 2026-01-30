# Tổng hợp Environment Variables

## Backend (api/.env)

### Bắt buộc
| Variable | Mô tả | Ví dụ |
|----------|-------|-------|
| `MONGO_URI` hoặc `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/cvmate` |
| `JWT_SECRET` | Secret key cho JWT tokens | Generate bằng: `openssl rand -base64 32` |
| `SESSION_SECRET` | Secret cho Express sessions | Random string |
| `FRONTEND_URL` | URL của frontend app | `http://localhost:5173` |
| `PORT` | Port cho backend server | `5001` (default) |
| `NODE_ENV` | Environment mode | `development` hoặc `production` |

### AI Features (OpenAI)
| Variable | Mô tả | Ví dụ |
|----------|-------|-------|
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `OPENAI_MODEL` | Model name | `gpt-3.5-turbo` (default) |

### Payment (Stripe)
| Variable | Mô tả | Ví dụ |
|----------|-------|-------|
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` hoặc `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |

### OAuth (Google) - Optional
| Variable | Mô tả | Ví dụ |
|----------|-------|-------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `xxx` |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | `http://localhost:5001/api/auth/google/callback` |

### News API - Optional
| Variable | Mô tả | Ví dụ |
|----------|-------|-------|
| `NEWS_API_KEY` | NewsAPI key | `xxx` |

### Rate Limiting - Optional
| Variable | Mô tả | Default |
|----------|-------|---------|
| `FREE_USER_DAILY_LIMIT` | Free user daily limit | `10` |
| `AUTH_RATE_LIMIT` | Auth attempts per 15min | `5` |
| `AI_RATE_LIMIT` | AI requests per hour | `20` |

### File Upload - Optional
| Variable | Mô tả | Default |
|----------|-------|---------|
| `MAX_FILE_SIZE` | Max file size in bytes | `5242880` (5MB) |

## Frontend (.env)

| Variable | Mô tả | Ví dụ |
|----------|-------|-------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5001/api` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (optional) | `pk_test_...` |

## Nơi sử dụng trong Code

### Backend
- `api/config/db.ts` - `MONGO_URI` hoặc `MONGODB_URI`
- `api/config/passport.ts` - `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `api/controllers/*.ts` - `OPENAI_API_KEY`, `OPENAI_MODEL`
- `api/controllers/paymentController.ts` - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL`
- `api/app.ts` - `FRONTEND_URL`, `SESSION_SECRET`, `NODE_ENV`
- `api/server.ts` - `PORT`, `NODE_ENV`
- `api/middleware/rateLimiter.ts` - `FREE_USER_DAILY_LIMIT`, `AUTH_RATE_LIMIT`, `AI_RATE_LIMIT`
- `api/middleware/upload.ts` - `MAX_FILE_SIZE`
- `api/services/newsService.ts` - `NEWS_API_KEY`

### Frontend
- `src/lib/utils.ts` - `VITE_API_URL`
- `src/pages/*.tsx` - `VITE_API_URL`
- `src/store/*.ts` - `VITE_API_URL`
- `vite.config.ts` - `VITE_API_URL` (proxy)

## Checklist Setup

### Backend
- [ ] Copy `api/.env.example` to `api/.env`
- [ ] Điền `MONGO_URI` hoặc `MONGODB_URI`
- [ ] Generate và điền `JWT_SECRET`
- [ ] Điền `SESSION_SECRET`
- [ ] Điền `FRONTEND_URL`
- [ ] (Optional) Điền `OPENAI_API_KEY` nếu dùng AI features
- [ ] (Optional) Điền Stripe keys nếu dùng payment
- [ ] (Optional) Điền Google OAuth nếu dùng OAuth

### Frontend
- [ ] Copy `.env.example` to `.env`
- [ ] Điền `VITE_API_URL`
- [ ] (Optional) Điền `VITE_STRIPE_PUBLISHABLE_KEY` nếu dùng payment

## Security Notes

1. **KHÔNG commit `.env` files vào git**
2. **Sử dụng `.env.example` làm template**
3. **Production**: Dùng strong secrets và production keys
4. **Development**: Có thể dùng test keys
5. **Rotate secrets** định kỳ trong production

## Generate Secrets

### JWT Secret
```bash
openssl rand -base64 32
```

### Session Secret
```bash
openssl rand -base64 32
```

### Hoặc dùng Node.js
```javascript
require('crypto').randomBytes(32).toString('base64')
```
