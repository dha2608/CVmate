# 📁 Cấu Trúc Dự Án CVmate - Hướng Dẫn cho Developers

## 🎯 Tổng Quan Project

**CVmate** là nền tảng AI hỗ trợ sự nghiệp gồm 2 phần chính:
- **Frontend:** React + Vite (web responsive)
- **Backend:** Node.js + Express + MongoDB

---

## 📦 Cấu Trúc Thư Mục Root

```
cvmate/
├── 📄 Tệp cấu hình & config
│   ├── package.json              # Dependencies + scripts
│   ├── tsconfig.json             # TypeScript config
│   ├── vite.config.ts            # Vite build config
│   ├── eslint.config.js          # Code linting rules
│   ├── postcss.config.js         # CSS processing
│   ├── tailwind.config.js        # Tailwind CSS config
│   ├── nodemon.json              # Dev server auto-reload (backend)
│   ├── vercel.json               # Deployment config (Vercel)
│   └── index.html                # HTML entry point
│
├── 📂 api/                       # 🔥 BACKEND (Node.js + Express)
├── 📂 src/                       # 🎨 FRONTEND (React + Vite)
├── 📂 public/                    # Static assets
└── 📄 README.md                  # Documentation
```

---

## 🔥 BACKEND STRUCTURE: `/api`

Kiến trúc **MVC** (Model-View-Controller) chuẩn:

```
api/
├── app.ts                        # Express app setup (middleware, routes)
├── server.ts                     # Server entry point
├── index.ts                      # Exports & main config
│
├── 📂 config/
│   └── db.ts                     # MongoDB connection (Mongoose)
│
├── 📂 controllers/               # 🧠 Business Logic
│   ├── authController.ts         # Login, Register, JWT
│   ├── dashboardController.ts    # User dashboard stats
│   ├── resumeController.ts       # CV CRUD + ATS Checker
│   ├── interviewController.ts    # AI Interview Simulator
│   ├── jobController.ts          # Job search/filter
│   ├── postController.ts         # Community posts
│   ├── articleController.ts      # Blog posts
│   ├── messageController.ts      # Chat/Messaging
│   └── notificationController.ts # Notifications
│
├── 📂 models/                    # 📊 Database Schema
│   ├── User.ts                   # User schema + auth fields
│   ├── Resume.ts                 # CV data + ATS score
│   ├── Interview.ts              # Interview sessions + feedback
│   ├── Job.ts                    # Job listings
│   ├── Post.ts                   # Community posts
│   ├── Article.ts                # Blog articles
│   ├── Message.ts                # Messages/Chat
│   └── Notification.ts           # Notifications
│
├── 📂 routes/                    # 🛣️ API Endpoints
│   ├── auth.ts                   # POST /auth/register, /login, /logout
│   ├── resume.ts                 # GET/POST/PUT /resume, /ats-check
│   ├── interview.ts              # POST /interview/start, /chat
│   ├── jobs.ts                   # GET /jobs, /jobs/:id
│   ├── posts.ts                  # GET/POST /posts, /like, /comment
│   ├── articles.ts               # GET /articles, /articles/:id
│   ├── messages.ts               # POST /messages, GET /messages/:userId
│   ├── notifications.ts          # GET /notifications
│   └── dashboard.ts              # GET /dashboard/stats
│
└── 📂 middleware/
    └── authMiddleware.ts         # JWT verification, role checking
```

### 🎯 Backend Flow Example:
```
Client Request → routes → controllers → models (Database) → Response
```

---

## 🎨 FRONTEND STRUCTURE: `/src`

Kiến trúc **Component-Based** (React best practices):

```
src/
├── main.tsx                      # Vite entry point
├── App.tsx                       # Root component + routing
├── index.css                     # Global styles
├── vite-env.d.ts                 # TypeScript Vite types
│
├── 📂 pages/                     # 📄 Full Page Components
│   ├── Home.tsx                  # Landing page
│   ├── Login.tsx                 # Authentication
│   ├── Register.tsx              # Sign up
│   ├── Dashboard.tsx             # User dashboard
│   ├── Builder.tsx               # 🔥 CV Builder (CORE)
│   ├── Interview.tsx             # 🤖 AI Interview Simulator
│   ├── Jobs.tsx                  # Job listings
│   ├── Blog.tsx                  # Blog articles list
│   ├── BlogDetail.tsx            # Single blog article
│   ├── Community.tsx             # Social feed
│   ├── Messaging.tsx             # Chat inbox
│   ├── Notifications.tsx         # Notifications page
│   └── Profile.tsx               # User profile
│
├── 📂 components/                # 🧩 Reusable UI Components
│   ├── Empty.tsx                 # Empty state component
│   │
│   ├── 📂 builder/               # CV Builder Components
│   │   ├── PersonalForm.tsx      # Name, contact info
│   │   ├── ExperienceForm.tsx    # Work experience
│   │   ├── EducationForm.tsx     # Education
│   │   ├── SkillsForm.tsx        # Skills list
│   │   └── ResumePreview.tsx     # Live preview (ATS template)
│   │
│   ├── 📂 community/             # Community Components
│   │   ├── CreatePost.tsx        # Post creation form
│   │   └── PostCard.tsx          # Post display card
│   │
│   ├── 📂 layout/                # Layout Components
│   │   └── MainLayout.tsx        # Navbar + Sidebar wrapper
│   │
│   └── 📂 ui/                    # Basic UI Elements (Shadcn/UI)
│       ├── button.tsx            # Reusable button
│       ├── input.tsx             # Reusable input
│       └── textarea.tsx          # Reusable textarea
│
├── 📂 hooks/                     # 🎣 Custom React Hooks
│   └── useTheme.ts               # Dark/Light theme toggle
│
├── 📂 store/                     # 🏪 State Management (Zustand)
│   ├── authStore.ts              # Auth state (login, user data)
│   ├── resumeStore.ts            # CV data state
│   ├── jobStore.ts               # Job search state
│   ├── communityStore.ts         # Posts state
│   ├── messageStore.ts           # Chat messages state
│   └── blogStore.ts              # Blog articles state
│
├── 📂 lib/                       # 🛠️ Utilities
│   └── utils.ts                  # Helper functions (API calls, formatters)
│
└── 📂 assets/                    # 📸 Images, Icons, etc.
```

### 🎯 Frontend Data Flow:
```
User Action → Store (Zustand) → Component Re-render → Backend API
```

---

## 🔗 Key Integration Points

### Frontend → Backend Communication:
- **API Base:** Stored in `utils.ts` (e.g., `http://localhost:5000/api`)
- **Authentication:** JWT token từ `authStore.ts`
- **All requests:** Qua `fetch` hoặc `axios` từ utils

### Example Flow: Create CV
```
1. User fills form in Builder.tsx
2. Data saved to resumeStore (local state)
3. Click "Save" → API call to /api/resume (POST)
4. Backend: resumeController.createResume()
5. Database: Mongoose saves to Resume collection
6. Response → Update resumeStore + show success toast
```

### Example Flow: AI Interview
```
1. Interview.tsx loads
2. User selects persona (HR, Manager, etc.)
3. POST /api/interview/start → interviewController
4. Creates Interview document in DB
5. Chat messages flow through interviewStore
6. Each message → OpenAI API (in backend)
7. Response → Update interview + provide feedback
```

---

## 📊 Database Collections (MongoDB)

Dựa theo models trong `/api/models/`:

| Collection | Purpose | Key Fields |
|-----------|---------|-----------|
| **Users** | User accounts | `_id`, `email`, `password`, `name`, `avatar`, `role` |
| **Resumes** | CV data | `user_id`, `title`, `content` (JSON), `ats_score` |
| **Interviews** | Interview sessions | `user_id`, `persona_type`, `chat_history`, `feedback` |
| **Posts** | Community posts | `user_id`, `content`, `image_url`, `likes[]`, `comments[]` |
| **Articles** | Blog posts | `title`, `content`, `author_id`, `summary` |
| **Jobs** | Job listings | `title`, `company`, `description`, `requirements[]` |
| **Messages** | Chat messages | `sender_id`, `receiver_id`, `content`, `timestamp` |
| **Notifications** | User notifications | `user_id`, `message`, `type`, `read` |

---

## 🚀 Làm Việc với Project

### Backend Dev Tasks:
```bash
# 1. Modify models/ → update database schema
# 2. Create controller method → handle business logic
# 3. Add route → expose via API endpoint
# 4. Test with Postman/Thunder Client

Example: Add new CV field
- models/Resume.ts → thêm field
- resumeController.ts → handle trong updateResume()
- routes/resume.ts → call controller
```

### Frontend Dev Tasks:
```bash
# 1. Create/modify pages/ → full page features
# 2. Create components/ → reusable parts
# 3. Update store/ → manage state
# 4. Call API from utils.ts → fetch data

Example: Update CV Builder
- components/builder/ → modify forms
- resumeStore.ts → manage CV state
- pages/Builder.tsx → orchestrate components
```

---

## ⚙️ Config Files Cheat Sheet

| File | Purpose |
|------|---------|
| `package.json` | Scripts: `npm run dev`, `npm run build` |
| `vite.config.ts` | Frontend build config + dev server |
| `tsconfig.json` | TypeScript strict mode, paths |
| `tailwind.config.js` | Custom colors, spacing (Design System) |
| `eslint.config.js` | Code quality rules |
| `vercel.json` | Frontend deployment settings |
| `nodemon.json` | Backend auto-reload on file change |

---

## 💡 Best Practices

### ✅ DO:
- **Backend:** Mỗi endpoint validate input, return consistent JSON
- **Frontend:** Components nhỏ, reusable, props well-typed
- **State:** Dùng Zustand store, không prop drilling
- **API:** Tất cả calls qua utils.ts (dễ manage base URL)
- **Error Handling:** Try-catch + user-friendly messages

### ❌ DON'T:
- Không hardcode URLs (use `utils.ts`)
- Không state quá sâu vào props (use store)
- Không mix UI logic với business logic
- Không fetch từ random places (centralize)

---

## 📞 Quick Reference

**Muốn thêm feature mới?**

1. **Backend:** 
   - `models/` → define schema
   - `controllers/` → write logic
   - `routes/` → add endpoint

2. **Frontend:**
   - `pages/` hoặc `components/` → UI
   - `store/` → state management
   - `utils.ts` → API integration

3. **Connect:** Frontend store → API call → Backend controller → Database

---

**Last Updated:** January 2026
