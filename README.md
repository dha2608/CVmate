# CV Mate - AI Career Ecosystem

CV Mate is an "All-in-one" career support platform powered by AI, designed to help users create ATS-friendly CVs in under 5 minutes and practice interviews with AI personas.

## ✨ Features

### 🔐 Authentication & Onboarding
- **Email/Password** authentication
- **Google OAuth 2.0** integration
- **Onboarding flow** - Set your career goal (New Job, Internship, Career Switch)

### 📝 CV Builder (Core Feature)
- **ATS-friendly templates** - Black & white, minimal columns
- **AI Enhance** - Transform raw bullet points into professional language
- **ATS Checker** - Compare CV with Job Description, get keyword suggestions
- **PDF Export** - Download selectable PDF with jsPDF
- **Template Selector** - Multiple professional templates
- **Section Reorder** - Drag & drop sections
- **AI Suggestions** - Smart content suggestions

### 🤖 AI Interview Simulator (Killer Feature)
- **3 AI Personas**:
  - Friendly HR - Focus on culture fit and soft skills
  - Strict Manager - Technical challenges and problem-solving
  - English Native - Language proficiency test
- **Speech-to-Text** - Voice input using Web Speech API
- **Real-time Feedback** - Confidence score, accuracy, improvement suggestions

### 👥 Community Hub
- **Newsfeed** - Share posts and get feedback
- **CV Sharing** - Share CV (with sensitive info hidden) for community feedback
- **Interactions** - Like and comment on posts

### 📰 Career Blog
- **CMS Admin** - Create and manage articles
- **AI Summary** - Auto-generate article summaries

### 💼 Job Search
- **Job Listings** - Browse and search jobs
- **AI Job Matcher** - Match CV with job descriptions
- **Bookmarks** - Save favorite jobs

## 🛠️ Tech Stack

- **Frontend**: React + Vite, TypeScript, Tailwind CSS, Shadcn/UI, Zustand, Framer Motion
- **Backend**: Node.js + Express.js, MongoDB (Mongoose)
- **AI**: OpenAI API (gpt-3.5-turbo / gpt-4o-mini)
- **Authentication**: JWT + Google OAuth 2.0 (Passport.js)
- **PDF Export**: jsPDF + html2canvas
- **Speech Recognition**: Web Speech API (Browser native)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or MongoDB Atlas)
- OpenAI API Key (for AI features)
- Google OAuth 2.0 credentials (for Google login - optional)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd CVmate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**

#### Backend (`.env` in project root or `api/`)

```env
# Server
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/cvmate
# MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cvmate

# JWT Secret (required - at least 32 characters)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Session Secret (for OAuth)
SESSION_SECRET=your-session-secret-key-change-this

# OpenAI API (AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
# Or gpt-4o-mini for production

# Google OAuth 2.0 (optional)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
# Production: https://yourdomain.com/api/auth/google/callback

# Frontend URL (CORS + OAuth redirect)
FRONTEND_URL=http://localhost:5173
# Production: https://yourdomain.com

# Rate Limiting (optional; defaults exist)
AI_RATE_LIMIT=100
FREE_USER_DAILY_LIMIT=100
AUTH_RATE_LIMIT=5
```

#### Frontend (`.env` in project root)

```env
VITE_API_URL=http://localhost:5001/api
# Production: https://api.yourdomain.com/api
```

#### Notes

- AI features require `OPENAI_API_KEY` and OpenAI account credits.
- Google OAuth requires HTTPS in production.

### Running the App

**Start both frontend and backend:**
```bash
npm run dev
```

**Or run separately:**
```bash
# Frontend only
npm run client:dev

# Backend only
npm run server:dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5001

### Verify Setup

Check environment variables:
```bash
node api/scripts/check-env.js
```

## 🚀 Deployment

### Deploy on Vercel

#### Files to check

- `vercel.json` - routing configuration
- `package.json` - scripts and dependencies
- `api/index.ts` - serverless entry point

#### Vercel Dashboard settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Environment Variables

**Required**
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

**Recommended / Optional**
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo
FRONTEND_URL=https://your-domain.vercel.app
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://your-domain.vercel.app/api/auth/google/callback
STRIPE_SECRET_KEY=sk_...
NEWS_API_KEY=...
```

### Other platforms

- **Railway**: Deploy from GitHub, add environment variables.
- **Render**: Web Service, build `npm run build`, start with appropriate server command.
- **Heroku**: Connect repo, deploy branch, set Config Vars.

### Post-deploy checks

1. Health: `https://your-domain.com/api/health`
2. Frontend: `https://your-domain.com`
3. API: `https://your-domain.com/api/*`

## 📁 Project Structure

```
CVmate/
├── api/                    # Backend (Node.js + Express)
│   ├── config/            # Database, Passport config
│   ├── controllers/       # Business logic
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth, Rate limiting
│   ├── services/          # External services
│   ├── utils/             # Utilities (logger, errors, validators)
│   └── scripts/           # Utility scripts
├── src/                   # Frontend (React + Vite)
│   ├── components/        # Reusable components
│   ├── pages/             # Page components
│   ├── store/             # Zustand state management
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities & API helpers
│   └── styles/            # CSS files
└── public/                # Static assets
```

## 🔒 Security & Rate Limiting

- **Free Users**: 10 requests/day for ATS Checker & Interview sessions
- **AI Endpoints**: 20 requests/hour for AI Enhance & Interview chat
- **Auth Endpoints**: 5 requests/15 minutes for login/register

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev              # Run both frontend and backend
npm run client:dev       # Frontend only
npm run server:dev       # Backend only

# Build
npm run build            # Build frontend for production

# Utilities
node api/scripts/check-env.js    # Check environment variables
node api/scripts/kill-port.js    # Kill process on port 5001
```

## 📝 License

MIT

---

**Last Updated**: 2026-02-03
