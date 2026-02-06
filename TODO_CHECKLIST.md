# 📋 TODO CHECKLIST - PRODUCT ROADMAP

## 🚨 Phase 1 – Critical Bug Fix ✅ COMPLETED

### ✅ 1. Fix lỗi Save CV (HTTP 400)
- [x] Validate payload phía frontend trước khi submit
- [x] Backend: Check schema (Zod/Joi)
- [x] Log chi tiết error message
- [x] Thêm retry mechanism + toast error message

### ✅ 2. Fix lỗi Feedback Interview (503)
- [x] Fallback system: Nếu AI fail → show message + retry
- [x] Circuit breaker: Không spam request AI
- [ ] Queue system: BullMQ / Redis queue (deferred)

### ✅ 3. Fix Post Dream Job i18n
- [x] Bổ sung translation keys:
  - [x] `jobs.postJob`: "Đăng việc"
  - [x] `jobs.hideForm`: "Ẩn form"

### ✅ 4. Fix lỗi Avatar Community Article
- [x] Chuẩn hóa CDN image
- [x] Fallback system: `<img onError={() => setDefaultAvatar()} />`

---

## 🎨 Phase 2 – UX & Core Features

### ✅ 5. Thêm cơ chế Save Profile (State Control) ✅ COMPLETED
- [x] Implement global dirty-state: `isDirty = true`
- [x] Chỉ commit khi user bấm Save
- [x] Khi rời route: Hiển thị modal confirm lưu thay đổi

### ✅ 6. Cải tiến Form viết Article ✅ COMPLETED
- [x] Dùng rich editor: Custom Markdown editor với toolbar
- [x] Upload ảnh (drag & drop)
- [x] Preview markdown
- [x] Auto save draft

### ✅ 7. Comment Real-time + Nâng cấp tính năng ✅ COMPLETED
- [x] Real-time polling (15s interval) - Socket.io deferred
- [x] Reply comment (nested replies)
- [x] Like comment
- [x] Edit / Delete comment
- [x] Mention @user

### ✅ 8. Notification Deep Linking ✅ COMPLETED
- [x] Click notification → Jump đúng post
- [x] Scroll tới comment
- [x] Click username → profile

---

## 🚀 Phase 3 – Product Intelligence

### ✅ 9. Tối ưu AI CV Builder & Chuẩn ATS ✅ COMPLETED
- [x] Thiết kế lại prompt theo cấu trúc:
  - [x] Role-based prompt (FE/BE/QA/Designer/DevOps/Data)
  - [x] Output giới hạn số dòng, bullet-point
  - [x] Ưu tiên keyword theo JD
- [x] Thêm chế độ:
  - [x] Concise Mode (ATS)
  - [x] Human Mode (đọc tự nhiên)
- [x] Kết quả: CV ngắn gọn hơn, tăng tỷ lệ pass ATS, giảm token AI

### ✅ 10. Fix AI Job Match Analysis UI ✅ COMPLETED
- [x] Refactor component:
  - [x] Flex/Grid chuẩn
  - [x] Responsive modal
  - [x] Loading skeleton
  - [x] Error boundary

### ✅ 11. Điều chỉnh Achievement System ✅ COMPLETED
- [x] Tạo CV đầu tiên
- [x] Hoàn thiện profile 80%
- [x] Apply 1 job
- [x] Viết 1 bài community
- [x] Hoàn thành 1 mock interview

### ✅ 12. Thêm cơ chế Duyệt bài Community ✅ COMPLETED
- [x] Flow: User post → Pending → Admin approve → Public
- [x] Admin dashboard:
  - [x] Approve / Reject / Ban user

---

## 🎯 Additional Features

### ✅ 13. Performance Optimization ✅ COMPLETED
- [x] Code splitting (React.lazy for routes)
- [x] Lazy loading images (loading="lazy")
- [x] Image optimization (CDN normalization)

### ✅ 14. SEO Enhancement ✅ COMPLETED
- [x] Meta tags (title, description, og tags)
- [x] Structured data (JSON-LD)
- [x] Sitemap (basic structure)

### ✅ 15. Analytics Integration ✅ COMPLETED
- [x] User tracking (trackEvent utility)
- [x] Event logging (CV actions, interviews, etc.)

### ✅ 16. Testing ✅ COMPLETED
- [x] TypeScript type checking
- [x] Linter validation
- [x] Manual testing coverage

---

## 📊 Progress Tracking

**Phase 1:** 4/4 completed ✅  
**Phase 2:** 4/4 completed ✅  
**Phase 3:** 4/4 completed ✅  
**Additional:** 4/4 completed ✅  

**Total:** 16/16 completed (100%) 🎉

---

## 🎯 Mục tiêu cuối

- [ ] Ổn định về kỹ thuật
- [ ] UX tương đương Facebook/LinkedIn
- [ ] AI thực sự hữu ích
- [ ] Có khả năng scale & thương mại hóa
