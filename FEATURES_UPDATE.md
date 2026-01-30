# Cập nhật Tính năng - CV Mate

## Tổng quan
Tài liệu này mô tả các tính năng mới đã được thêm vào CV Mate.

## 1. Upload Ảnh Profile (Nhiều Lựa Chọn)

### Tính năng
- Người dùng có thể upload ảnh từ máy tính hoặc nhập URL
- Hỗ trợ preview ảnh trước khi lưu
- Validate file type và size (max 5MB)
- Hỗ trợ các định dạng: JPG, PNG, GIF, WebP

### Files đã thêm/sửa
- `api/middleware/upload.ts` - Multer middleware cho file upload
- `api/controllers/uploadController.ts` - Controller xử lý upload
- `api/routes/upload.ts` - Routes cho upload
- `src/pages/Profile.tsx` - UI với toggle giữa Upload và URL

### Cấu hình
- Files được lưu trong thư mục `uploads/`
- Trong production, nên sử dụng Cloudinary hoặc AWS S3

## 2. Hệ thống Free/Premium với Thanh toán

### Tính năng
- Phân biệt người dùng Free và Premium
- Tích hợp Stripe cho thanh toán
- Webhook để xử lý subscription events
- UI hiển thị subscription status trong Profile

### Files đã thêm/sửa
- `api/models/User.ts` - Thêm field `subscription`
- `api/controllers/paymentController.ts` - Xử lý thanh toán
- `api/routes/payment.ts` - Routes cho payment
- `api/middleware/premiumMiddleware.ts` - Middleware check premium
- `src/pages/PaymentSuccess.tsx` - Trang success sau thanh toán
- `src/pages/PaymentCancel.tsx` - Trang cancel
- `src/pages/Profile.tsx` - Hiển thị subscription status

### Cấu hình
Thêm vào `.env`:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:5173
```

### Sử dụng Premium Middleware
```typescript
import { requirePremium } from '../middleware/premiumMiddleware.js';

router.post('/premium-feature', protect, requirePremium, premiumFeature);
```

## 3. Mở rộng Latest Career News

### Tính năng
- Thêm nhiều nguồn RSS feeds (12 nguồn)
- Cache news để tối ưu performance
- Auto-refresh mỗi giờ
- Error handling tốt hơn

### Nguồn tin đã thêm
- Forbes Careers
- LinkedIn News
- Glassdoor Blog
- Indeed Career Guide
- Monster Career Advice
- CareerBuilder Blog
- Workopolis
- The Balance Careers
- (và các nguồn hiện có)

### Files đã sửa
- `api/services/newsService.ts` - Mở rộng RSS_FEEDS array

## 4. Hệ thống Job và Tuyển dụng

### Tính năng
- Tìm kiếm job với filters (type, location)
- Pagination
- Apply job với status tracking
- UI cải thiện với animations

### Files đã sửa
- `src/store/jobStore.ts` - Sử dụng API từ utils
- `src/pages/Jobs.tsx` - UI với filters và search
- `api/routes/jobs.ts` - Thêm route getJobById
- `src/lib/utils.ts` - Thêm API methods cho jobs

### Tính năng Job
- Search by title, company, description
- Filter by type (Full-time, Part-time, Remote, etc.)
- Filter by location
- Track applied jobs
- Pagination support

## 5. Fix Lỗi JSX

### Đã fix
- Lỗi JSX trong BlogDetail.tsx (đã có fragment đúng cách)

## Cấu hình Môi trường

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/cvmate

# JWT
JWT_SECRET=your-secret-key

# OpenAI (cho AI features)
OPENAI_API_KEY=sk-...

# Stripe (cho payment)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173

# News API (optional)
NEWS_API_KEY=...
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001/api
```

## Hướng dẫn Sử dụng

### 1. Upload Avatar
1. Vào Profile page
2. Click "Edit Profile"
3. Chọn "Upload" hoặc "URL"
4. Nếu Upload: chọn file từ máy tính
5. Nếu URL: paste link ảnh
6. Click "Save Changes"

### 2. Upgrade to Premium
1. Vào Profile page
2. Xem section "Subscription Status"
3. Click "Upgrade to Premium"
4. Điều hướng đến Stripe Checkout
5. Hoàn tất thanh toán
6. Redirect về success page

### 3. Tìm kiếm Job
1. Vào Jobs page
2. Nhập từ khóa vào search box
3. Chọn filter (type, location)
4. Click "Search"
5. Click "Apply" để apply job

### 4. Xem Latest News
1. Vào Blog page
2. Tab "Latest News" (mặc định)
3. Click "Refresh" để cập nhật
4. Click "Read More" để mở link gốc

## Lưu ý

1. **File Upload**: Trong production, nên sử dụng Cloudinary hoặc AWS S3 thay vì lưu local
2. **Stripe**: Cần cấu hình webhook endpoint trong Stripe Dashboard
3. **News Feeds**: Một số RSS feeds có thể không hoạt động, hệ thống sẽ tự động skip
4. **Premium Features**: Cần thêm `requirePremium` middleware vào các routes cần premium

## Next Steps

1. Tích hợp Cloudinary cho image upload
2. Thêm email notifications cho job applications
3. Thêm job detail page
4. Thêm analytics cho job views
5. Thêm job recommendations dựa trên user profile
