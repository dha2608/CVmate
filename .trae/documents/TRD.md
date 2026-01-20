# TÀI LIỆU YÊU CẦU SẢN PHẨM: CV MATE

**Loại tài liệu:** Technical Requirement Document (TRD)
**Dự án:** CV Mate - AI Career Ecosystem
**Phiên bản:** 1.0 Final
**Người yêu cầu:** Product Owner

## 1. TỔNG QUAN VÀ MỤC TIÊU (EXECUTIVE SUMMARY)
CV Mate là nền tảng "All-in-one" hỗ trợ sự nghiệp, tập trung vào việc giảm tải công sức (low-effort) cho người dùng bằng AI.

*   **Mục tiêu cốt lõi:** Giúp người dùng tạo CV chuẩn ATS trong < 5 phút và luyện phỏng vấn thực tế ảo.
*   **Unique Selling Point (USP):**
    *   **AI Writer:** Biến gạch đầu dòng thô thành văn phong chuyên nghiệp.
    *   **Interview Simulator:** Đối thoại với các "nhân cách" AI khác nhau.
*   **Nền tảng mục tiêu:** Web App (Responsive Mobile/Desktop).

## 2. YÊU CẦU THIẾT KẾ (DESIGN SYSTEM)
Giao diện cần tuân thủ nghiêm ngặt quy tắc tối giản (Minimalism) và tương phản cao.

### 2.1. Bảng màu (Color Palette)
*   **Primary (Nền/Không gian):** White (#FFFFFF) - Sử dụng cho 80% diện tích web.
*   **Secondary (Văn bản/Khối chính):** Jet Black (#121212) - Dùng cho Text, Footer, Navbar.
*   **Accent (Hành động/Điểm nhấn):** Crimson Red (#DC143C) hoặc Fire Engine Red (#CE1126) - Dùng cho nút CTA (Create CV), biểu tượng AI, thông báo lỗi.
*   **Neutral:** Light Grey (#F5F5F5) - Dùng cho các đường viền, background phụ.

### 2.2. Typography & Layout
*   **Font:** Inter hoặc Roboto (Google Fonts) - Dễ đọc, hiện đại.
*   **Bố cục:** Dạng lưới (Grid system), khoảng trắng (white-space) lớn để tạo cảm giác sang trọng ("Premium feel").

## 3. KIẾN TRÚC KỸ THUẬT (TECHNICAL ARCHITECTURE)

### 3.1. Tech Stack (Bắt buộc)
*   **Frontend:** React.js (Framework: Next.js 14+) - Lý do: Tối ưu SEO cho trang tin tức và profile công khai, render nhanh. (Note: Project initialized with Vite + React template for rapid development in this environment, can be migrated to Next.js if SEO becomes critical blocker).
*   **State Management:** Redux Toolkit hoặc Zustand.
*   **UI Library:** Tailwind CSS + Shadcn/UI.
*   **Backend:** Node.js + Express.js.
*   **Database:** MongoDB (Mongoose ODM).
*   **AI Engine:** OpenAI API (Model gpt-4o-mini hoặc gpt-3.5-turbo).
*   **Authentication:** JWT + Google OAuth 2.0.

### 3.2. Hạ tầng & Triển khai
*   **Frontend Host:** Vercel.
*   **Backend Host:** Render.
*   **Storage:** Cloudinary hoặc AWS S3.

## 4. CHI TIẾT TÍNH NĂNG (FUNCTIONAL MODULES)

### MODULE 1: AUTH & USER DASHBOARD
*   **Đăng ký/Đăng nhập:** Email/Password & Google Login.
*   **Onboarding:** Hỏi mục tiêu (Tìm việc mới / Thực tập / Nhảy việc).
*   **Dashboard:** Thống kê CV, phỏng vấn, bài viết đã lưu.

### MODULE 2: CV MATE BUILDER (CORE)
*   **Template:** Chuẩn ATS (Trắng đen, ít cột).
*   **Nhập liệu:**
    *   AI Enhance: Biến input thô thành văn phong chuyên nghiệp.
*   **ATS Checker:** So sánh CV vs JD, chấm điểm, gợi ý từ khóa.
*   **Export:** PDF (text selectable).

### MODULE 3: AI INTERVIEW SIMULATOR (KILLER FEATURE)
*   **Personas:** Friendly HR, Strict Manager, English Native.
*   **Interface:** Chat + Speech-to-Text.
*   **Feedback:** Độ tự tin, độ chính xác, gợi ý cải thiện.

### MODULE 4: CỘNG ĐỒNG (SOCIAL HUB)
*   **Newsfeed:** User post bài.
*   **Khoe CV:** Share CV (che thông tin nhạy cảm) để nhận feedback.
*   **Tương tác:** Like, Comment.

### MODULE 5: TIN TỨC (CAREER BLOG)
*   **CMS Admin:** Soạn thảo bài viết.
*   **AI Summary:** Tóm tắt bài viết.

## 5. CẤU TRÚC CƠ SỞ DỮ LIỆU (DATABASE SCHEMA - DRAFT)
*   **Users:** `_id`, `name`, `email`, `password`, `avatar`, `role`, `bio`, `cv_list[]`
*   **Resumes:** `_id`, `user_id`, `title`, `content` (JSON), `ats_score`, `theme_config`
*   **Interviews:** `_id`, `user_id`, `persona_type`, `chat_history`, `feedback_report`
*   **Posts:** `_id`, `user_id`, `content`, `image_url`, `likes[]`, `comments[]`

## 6. YÊU CẦU PHI CHỨC NĂNG
*   **Performance:** Lighthouse > 80.
*   **AI Latency:** Loading state vui nhộn.
*   **Security:** Rate limiting (10 req/day/free user).
*   **SEO:** Meta tags động.

## 7. TIÊU CHÍ NGHIỆM THU
*   User tạo được CV, tải PDF ATS.
*   AI viết lại nội dung tốt.
*   Phỏng vấn ảo hoạt động.
*   Deploy thành công.
*   UI đúng chuẩn.
