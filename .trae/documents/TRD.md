# TÀI LIỆU YÊU CẦU SẢN PHẨM: CV MATE

**Loại tài liệu:** Technical Requirement Document (TRD)
**Dự án:** CV Mate - AI Career Ecosystem
**Phiên bản:** 1.0 Final
**Người yêu cầu:** Product Owner

## 1. TỔNG QUAN VÀ MỤC TIÊU (EXECUTIVE SUMMARY)

CV Mate là nền tảng "All-in-one" hỗ trợ sự nghiệp, tập trung vào việc giảm tải công sức (low-effort) cho người dùng bằng AI.

* **Mục tiêu cốt lõi:** Giúp người dùng tạo CV chuẩn ATS trong < 5 phút và luyện phỏng vấn thực tế ảo.

* **Unique Selling Point (USP):**

  * **AI Writer:** Biến gạch đầu dòng thô thành văn phong chuyên nghiệp.

  * **Interview Simulator:** Đối thoại với các "nhân cách" AI khác nhau.

* **Nền tảng mục tiêu:** Web App (Responsive Mobile/Desktop).

## 2. YÊU CẦU THIẾT KẾ (DESIGN SYSTEM)

Giao diện cần tuân thủ nghiêm ngặt quy tắc tối giản (Minimalism) và tương phản cao.

### 2.1. Bảng màu (Color Palette)

* **Primary (Nền/Không gian):** White (#FFFFFF) - Sử dụng cho 80% diện tích web.

* **Secondary (Văn bản/Khối chính):** Jet Black (#121212) - Dùng cho Text, Footer, Navbar.

* **Accent (Hành động/Điểm nhấn):** Crimson Red (#DC143C) hoặc Fire Engine Red (#CE1126) - Dùng cho nút CTA (Create CV), biểu tượng AI, thông báo lỗi.

* **Neutral:** Light Grey (#F5F5F5) - Dùng cho các đường viền, background phụ.

### 2.2. Typography & Layout

* **Font:** Inter hoặc Roboto (Google Fonts) - Dễ đọc, hiện đại.

* **Bố cục:** Dạng lưới (Grid system), khoảng trắng (white-space) lớn để tạo cảm giác sang trọng ("Premium feel").

## 3. KIẾN TRÚC KỸ THUẬT (TECHNICAL ARCHITECTURE)

### 3.1. Tech Stack (Bắt buộc)

* **Frontend:** React.js (Framework: Next.js 14+) - Lý do: Tối ưu SEO cho trang tin tức và profile công khai, render nhanh. (Note: Project initialized with Vite + React template for rapid development in this environment, can be migrated to Next.js if SEO becomes critical blocker).

* **State Management:** Redux Toolkit hoặc Zustand.

* **UI Library:** Tailwind CSS + Shadcn/UI.

* **Backend:** Node.js + Express.js.

* **Database:** MongoDB (Mongoose ODM).

* **AI Engine:** OpenAI API (Model gpt-4o-mini hoặc gpt-3.5-turbo).

* **Authentication:** JWT + Google OAuth 2.0.

### 3.2. Hạ tầng & Triển khai

* **Frontend Host:** Vercel.

* **Backend Host:** Render.

* **Storage:** Cloudinary hoặc AWS S3.

## 4. CHI TIẾT TÍNH NĂNG (FUNCTIONAL MODULES)

### MODULE 1: AUTH & USER DASHBOARD

* **Đăng ký/Đăng nhập:** Email/Password & Google Login.

* **Onboarding:** Hỏi mục tiêu (Tìm việc mới / Thực tập / Nhảy việc).

* **Dashboard:** Thống kê CV, phỏng vấn, bài viết đã lưu.

### MODULE 2: CV MATE BUILDER (CORE)

* **Template:** Chuẩn ATS (Trắng đen, ít cột).

* **Nhập liệu:**

  * AI Enhance: Biến input thô thành văn phong chuyên nghiệp.

* **ATS Checker:** So sánh CV vs JD, chấm điểm, gợi ý từ khóa.

* **Export:** PDF (text selectable).

### MODULE 3: AI INTERVIEW SIMULATOR (KILLER FEATURE)

* **Personas:** Friendly HR, Strict Manager, English Native.

* **Interface:** Chat + Speech-to-Text.

* **Feedback:** Độ tự tin, độ chính xác, gợi ý cải thiện.

### MODULE 4: CỘNG ĐỒNG (SOCIAL HUB)

* **Newsfeed:** User post bài.

* **Khoe CV:** Share CV (che thông tin nhạy cảm) để nhận feedback.

* **Tương tác:** Like, Comment.

### MODULE 5: TIN TỨC (CAREER BLOG)

* **CMS Admin:** Soạn thảo bài viết.

* **AI Summary:** Tóm tắt bài viết.

## 5. CẤU TRÚC CƠ SỞ DỮ LIỆU (DATABASE SCHEMA - DRAFT)

* **Users:** `_id`, `name`, `email`, `password`, `avatar`, `role`, `bio`, `cv_list[]`

* **Resumes:** `_id`, `user_id`, `title`, `content` (JSON), `ats_score`, `theme_config`

* **Interviews:** `_id`, `user_id`, `persona_type`, `chat_history`, `feedback_report`

* **Posts:** `_id`, `user_id`, `content`, `image_url`, `likes[]`, `comments[]`

## 6. YÊU CẦU PHI CHỨC NĂNG

* **Performance:** Lighthouse > 80.

* **AI Latency:** Loading state vui nhộn.

* **Security:** Rate limiting (10 req/day/free user).

* **SEO:** Meta tags động.

## 7. TIÊU CHÍ NGHIỆM THU

* User tạo được CV, tải PDF ATS.

* AI viết lại nội dung tốt.

* Phỏng vấn ảo hoạt động.

* Deploy thành công.

* UI đúng chuẩn.

---

## 8. TASK BOARD TRIỂN KHAI (BÁM SÁT TRD)

> Quy ước trạng thái: `pending` | `in_progress` | `completed`
> 
> Quy ước ưu tiên: `P0` (bắt buộc cho MVP) | `P1` (quan trọng sau MVP) | `P2` (mở rộng)

### 8.1. TRACK TỔNG QUAN

- `P0`:
  - [completed] T0. Dọn trùng file path gây rủi ro build/routing trên FE.
  - [pending] T1. Auth + Onboarding flow hoàn chỉnh (email/password + Google OAuth).
  - [pending] T2. CV Builder MVP (form + template ATS + lưu Resume).
  - [pending] T3. Export PDF selectable text cho CV.
  - [pending] T4. AI Enhance cho bullet/section CV.
  - [pending] T5. Interview Simulator MVP (persona + chat history + feedback cơ bản).
  - [pending] T6. Dashboard thống kê cơ bản.
  - [pending] T7. Deploy FE/BE + smoke test acceptance.
- `P1`:
  - [pending] T8. ATS Checker (CV vs JD scoring + keyword suggestion).
  - [pending] T9. Community newsfeed + like/comment.
  - [pending] T10. Career Blog + AI Summary.
  - [pending] T11. Hardening security (rate limit free 10 req/day, input sanitize, audit logs).
- `P2`:
  - [pending] T12. Speech-to-Text cho Interview.
  - [pending] T13. Nâng cao UX loading/fallback/error states theo design system.
  - [pending] T14. SEO nâng cao (meta động sâu, sitemap tối ưu theo route công khai).

### 8.2. CHI TIẾT TASK THEO MODULE

#### MODULE 1: AUTH & USER DASHBOARD

- `T1` (`P0`) Auth + Onboarding
  - Scope:
    - Đăng ký/đăng nhập Email-Password.
    - Google OAuth callback ổn định.
    - JWT session + refresh flow (nếu có).
    - Onboarding mục tiêu nghề nghiệp.
  - Acceptance:
    - User mới vào onboarding sau đăng ký.
    - User cũ vào dashboard trực tiếp.
  - Cập nhật đã triển khai:
    - Login điều hướng theo `onboardingCompleted`.
    - Register luôn vào `/onboarding` sau khi tạo tài khoản.
    - `ProtectedRoute` chặn truy cập route protected khi chưa onboarding.
    - OAuth callback normalize `VITE_API_URL` để luôn gọi đúng `/api/auth/me`.
    - Login hiển thị thông báo lỗi OAuth từ query param `?error=`.
  - Status: `completed`

- `T6` (`P0`) Dashboard cơ bản
  - Scope: số lượng CV, phiên phỏng vấn, bài viết lưu.
  - Acceptance: load dữ liệu đúng theo user đăng nhập.
  - Status: `pending`

#### MODULE 2: CV MATE BUILDER (CORE)

- `T2` (`P0`) CV Builder MVP
  - Scope: form thông tin + lưu Resume JSON + template ATS cơ bản.
  - Acceptance: tạo/sửa/lưu CV thành công.
  - Cập nhật đã triển khai:
    - Builder hỗ trợ `create` CV mới và tự gắn `?id=` sau lần lưu đầu.
    - Builder hỗ trợ `update` CV hiện có khi có `id`.
    - Mở Builder với `?id=` sẽ load dữ liệu từ backend vào store để chỉnh sửa.
    - Chuẩn hóa mapping dữ liệu `experience/education` để đồng bộ FE/BE.
  - Status: `completed`

- `T3` (`P0`) Export PDF
  - Scope: xuất PDF text selectable.
  - Acceptance: copy text từ PDF được, layout không vỡ.
  - Status: `pending`

- `T4` (`P0`) AI Enhance
  - Scope: từ input thô -> văn phong chuyên nghiệp theo context vị trí.
  - Acceptance: có thể apply output vào section CV.
  - Status: `pending`

- `T8` (`P1`) ATS Checker
  - Scope: upload JD, chấm điểm, gợi ý từ khóa thiếu.
  - Acceptance: trả score + actionable suggestions.
  - Status: `pending`

#### MODULE 3: AI INTERVIEW SIMULATOR

- `T5` (`P0`) Interview MVP
  - Scope: persona (Friendly HR/Strict Manager/English Native), chat session, feedback cơ bản.
  - Acceptance: lưu lịch sử và hiển thị feedback cuối phiên.
  - Status: `pending`

- `T12` (`P2`) Speech-to-Text
  - Scope: nhập giọng nói trong phiên phỏng vấn.
  - Acceptance: chuyển giọng nói thành text ổn định.
  - Status: `pending`

#### MODULE 4: CỘNG ĐỒNG (SOCIAL HUB)

- `T9` (`P1`) Newsfeed + tương tác
  - Scope: post, like, comment, share CV che dữ liệu nhạy cảm.
  - Acceptance: feed realtime gần-thời-gian-thực, tương tác chính xác.
  - Status: `pending`

#### MODULE 5: CAREER BLOG

- `T10` (`P1`) CMS + AI Summary
  - Scope: CRUD bài viết admin + tóm tắt bài viết.
  - Acceptance: bài đăng public hiển thị đúng, summary tạo được.
  - Status: `pending`

### 8.3. TIẾN ĐỘ HIỆN TẠI

- Snapshot: `2026-02-27`
- Tổng task: `15`
- Completed: `3/15` (20.0%)
- In Progress: `0/15`
- Pending: `12/15`

### 8.4. TASK ĐANG CHẠY TIẾP THEO (NEXT ACTION)

- Chọn `T3 (P0) - Export PDF selectable text` làm task triển khai kế tiếp.
- Lý do:
  - Hoàn thiện luồng giá trị từ tạo CV -> xuất CV để ứng tuyển thực tế.
  - Là tiêu chí nghiệm thu trực tiếp trong TRD.

