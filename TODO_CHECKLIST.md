# 📋 TODO CHECKLIST - PRODUCT ROADMAP

## 🚨 Phase 1 – Critical Bug Fix

### ✅ 1. Fix lỗi Save CV (HTTP 400)
- [ ] Validate payload phía frontend trước khi submit
- [ ] Backend: Check schema (Zod/Joi)
- [ ] Log chi tiết error message
- [ ] Thêm retry mechanism + toast error message

### ✅ 2. Fix lỗi Feedback Interview (503)
- [ ] Fallback system: Nếu AI fail → show message + retry
- [ ] Circuit breaker: Không spam request AI
- [ ] Queue system: BullMQ / Redis queue

### ✅ 3. Fix Post Dream Job i18n
- [ ] Bổ sung translation keys:
  - [ ] `jobs.postJob`: "Đăng việc"
  - [ ] `jobs.hideForm`: "Ẩn form"

### ✅ 4. Fix lỗi Avatar Community Article
- [ ] Chuẩn hóa CDN image
- [ ] Fallback system: `<img onError={() => setDefaultAvatar()} />`

---

## 🎨 Phase 2 – UX & Core Features

### ✅ 5. Thêm cơ chế Save Profile (State Control)
- [ ] Implement global dirty-state: `isDirty = true`
- [ ] Chỉ commit khi user bấm Save
- [ ] Khi rời route: Hiển thị modal confirm lưu thay đổi

### ✅ 6. Cải tiến Form viết Article
- [ ] Dùng rich editor: TipTap / Quill / Slate
- [ ] Upload ảnh (drag & drop)
- [ ] Preview markdown
- [ ] Auto save draft

### ✅ 7. Comment Real-time + Nâng cấp tính năng
- [ ] Socket.io / Supabase Realtime
- [ ] Reply comment
- [ ] Like comment
- [ ] Edit / Delete comment
- [ ] Mention @user

### ✅ 8. Notification Deep Linking
- [ ] Click notification → Jump đúng post
- [ ] Scroll tới comment
- [ ] Click username → profile

---

## 🚀 Phase 3 – Product Intelligence

### ✅ 9. Tối ưu AI CV Builder & Chuẩn ATS
- [ ] Thiết kế lại prompt theo cấu trúc:
  - [ ] Role-based prompt (FE/BE/QA/Designer…)
  - [ ] Output giới hạn số dòng, bullet-point
  - [ ] Ưu tiên keyword theo JD
- [ ] Thêm chế độ:
  - [ ] Concise Mode (ATS)
  - [ ] Human Mode (đọc tự nhiên)
- [ ] Kết quả: CV ngắn gọn hơn, tăng tỷ lệ pass ATS, giảm token AI

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

**Phase 1:** 0/4 completed  
**Phase 2:** 0/4 completed  
**Phase 3:** 0/4 completed  
**Additional:** 0/4 completed  

**Total:** 0/16 completed

---

## 🎯 Mục tiêu cuối

- [ ] Ổn định về kỹ thuật
- [ ] UX tương đương Facebook/LinkedIn
- [ ] AI thực sự hữu ích
- [ ] Có khả năng scale & thương mại hóa
