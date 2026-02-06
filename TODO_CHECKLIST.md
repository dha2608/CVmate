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

### ✅ 10. Fix AI Job Match Analysis UI
- [ ] Refactor component:
  - [ ] Flex/Grid chuẩn
  - [ ] Responsive modal
  - [ ] Loading skeleton
  - [ ] Error boundary

### ✅ 11. Điều chỉnh Achievement System
- [ ] Tạo CV đầu tiên
- [ ] Hoàn thiện profile 80%
- [ ] Apply 1 job
- [ ] Viết 1 bài community
- [ ] Hoàn thành 1 mock interview

### ✅ 12. Thêm cơ chế Duyệt bài Community
- [ ] Flow: User post → Pending → Admin approve → Public
- [ ] Admin dashboard:
  - [ ] Approve / Reject / Ban user

---

## 🎯 Additional Features

### ✅ 13. UX Post Community giống Facebook
- [ ] Post card layout
- [ ] Image gallery
- [ ] Reaction (like, love, haha)
- [ ] Share post
- [ ] Infinite scroll

### ✅ 14. Thông báo Inbox (Real-time)
- [ ] WebSocket / Pusher / Firebase
- [ ] Notification badge: "Bạn có 1 tin nhắn chưa đọc"

### ✅ 15. Xem Profile người dùng khác
- [ ] Click username ở:
  - [ ] Comment
  - [ ] Notification
  - [ ] Message
- [ ] Redirect `/profile/:id`

### ✅ 16. Hiển thị bài viết Community hợp lý
- [ ] Show full content
- [ ] Nếu quá dài: [Xem thêm] expand inline (không scroll card)

---

## 📊 Progress Tracking

**Phase 1:** 4/4 completed ✅  
**Phase 2:** 4/4 completed ✅  
**Phase 3:** 1/4 completed (25%)  
**Additional:** 0/4 completed  

**Total:** 9/16 completed (56%)

---

## 🎯 Mục tiêu cuối

- [ ] Ổn định về kỹ thuật
- [ ] UX tương đương Facebook/LinkedIn
- [ ] AI thực sự hữu ích
- [ ] Có khả năng scale & thương mại hóa
