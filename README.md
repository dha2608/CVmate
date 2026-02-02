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

3. **Configure Environment Variables:**
   
   See [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) for detailed instructions.
   
   Create `.env` file in root directory:
   ```env
   # Server
   PORT=5001
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/cvmate
   
   # JWT Secret (required - at least 32 characters)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   SESSION_SECRET=your-session-secret-key-change-this
   
   # OpenAI API (for AI features)
   OPENAI_API_KEY=sk-your-openai-api-key-here
   OPENAI_MODEL=gpt-3.5-turbo
   
   # Google OAuth 2.0 (optional - for Google login)
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```
   
   Create `.env` for frontend (or use Vite env vars):
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

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
│   │   ├── ui/            # UI components
│   │   ├── layout/        # Layout components
│   │   ├── mobile/        # Mobile-specific components
│   │   └── accessibility/ # Accessibility components
│   ├── pages/             # Page components
│   ├── store/             # Zustand state management
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities & API helpers
│   └── styles/            # CSS files
└── public/                # Static assets
```

## 🎨 Design System

### Colors
- **Primary Color**: White (#FFFFFF) - 80% of space
- **Secondary Color**: Jet Black (#121212) - Text, Footer, Navbar
- **Accent Color**: Crimson Red (#DC143C) - CTA buttons, AI icons
- **Neutral**: Light Grey (#F5F5F5) - Borders, backgrounds

### Typography
- **Fonts**: Inter / Roboto (Google Fonts)
- **Style**: Minimalist with high contrast

### UI/UX Features
- ✅ Dark mode support
- ✅ Responsive design (mobile-first)
- ✅ Accessibility (WCAG AA compliant)
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Smooth animations (Framer Motion)
- ✅ Loading states & skeletons
- ✅ Error handling
- ✅ Empty states

## 🔒 Security & Rate Limiting

- **Free Users**: 10 requests/day for ATS Checker & Interview sessions
- **AI Endpoints**: 20 requests/hour for AI Enhance & Interview chat
- **Auth Endpoints**: 5 requests/15 minutes for login/register

## 📚 Documentation

### Setup & Configuration
- **[ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)** - Complete environment variables setup guide
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

### UI/UX Improvements
- **[UI_UX_IMPROVEMENT_PLAN.md](./UI_UX_IMPROVEMENT_PLAN.md)** - Full UI/UX improvement roadmap
- **[UI_UX_IMPLEMENTATION_GUIDE.md](./UI_UX_IMPLEMENTATION_GUIDE.md)** - Code examples and implementation guide
- **[UI_UX_COMPLETE_SUMMARY.md](./UI_UX_COMPLETE_SUMMARY.md)** - Summary of all UI/UX improvements

## 🚀 Deployment

### Frontend (Vercel)
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: Set `VITE_API_URL` in Vercel dashboard

### Backend (Render / Railway)
- Build command: `npm install`
- Start command: `npm run server:dev` (dev) or `node api/server.js` (prod)
- Environment variables: Set all required vars in platform dashboard

### Production Checklist
- [ ] All environment variables set
- [ ] `NODE_ENV=production`
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Database connection secure
- [ ] Rate limiting enabled
- [ ] Error logging configured

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev              # Run both frontend and backend
npm run client:dev      # Frontend only
npm run server:dev      # Backend only

# Build
npm run build           # Build frontend for production
npm run build:api       # Build backend (if needed)

# Utilities
node api/scripts/check-env.js    # Check environment variables
node api/scripts/kill-port.js    # Kill process on port 5001
```

## 🐛 Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed troubleshooting guide.

### Common Issues

1. **Port already in use (5001)**
   ```bash
   node api/scripts/kill-port.js
   ```

2. **Google OAuth not working**
   - Check [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)
   - Verify callback URL matches Google Console
   - Check server logs for errors

3. **AI features not working**
   - Verify `OPENAI_API_KEY` is set
   - Check OpenAI account has credits
   - See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📝 License

MIT

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Google for OAuth integration
- All open-source libraries used in this project

---

**Last Updated**: 2026-02-02
