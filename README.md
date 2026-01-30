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

## 🛠️ Tech Stack

- **Frontend**: React + Vite, TypeScript, Tailwind CSS, Shadcn/UI, Zustand
- **Backend**: Node.js + Express.js, MongoDB (Mongoose)
- **AI**: OpenAI API (gpt-3.5-turbo / gpt-4o-mini)
- **Authentication**: JWT + Google OAuth 2.0 (Passport.js)
- **PDF Export**: jsPDF + html2canvas
- **Speech Recognition**: Web Speech API (Browser native)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or MongoDB Atlas)
- OpenAI API Key
- Google OAuth 2.0 credentials (for Google login)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd CVmate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   
   See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions.
   
   Create `.env` file in root directory:
   ```env
   # Backend
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/cvmate
   JWT_SECRET=your-super-secret-jwt-key
   SESSION_SECRET=your-session-secret
   OPENAI_API_KEY=sk-your-openai-api-key
   OPENAI_MODEL=gpt-3.5-turbo
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
   
   # Frontend
   FRONTEND_URL=http://localhost:5173
   ```
   
   Create `.env` for frontend (or use Vite env vars):
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

### Running the App

Start both frontend and backend in development mode:

```bash
npm run dev
```

Or run separately:
```bash
# Frontend only
npm run client:dev

# Backend only
npm run server:dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5001

## 📁 Project Structure

```
CVmate/
├── api/                    # Backend (Node.js + Express)
│   ├── config/            # Database, Passport config
│   ├── controllers/       # Business logic
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   └── middleware/        # Auth, Rate limiting
├── src/                   # Frontend (React + Vite)
│   ├── components/        # Reusable components
│   ├── pages/             # Page components
│   ├── store/             # Zustand state management
│   └── lib/               # Utilities & API helpers
└── public/                # Static assets
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed structure.

## 🎨 Design System

- **Primary Color**: White (#FFFFFF) - 80% of space
- **Secondary Color**: Jet Black (#121212) - Text, Footer, Navbar
- **Accent Color**: Crimson Red (#DC143C) - CTA buttons, AI icons
- **Neutral**: Light Grey (#F5F5F5) - Borders, backgrounds
- **Typography**: Inter / Roboto (Google Fonts)
- **Style**: Minimalist with high contrast

## 🔒 Security & Rate Limiting

- **Free Users**: 10 requests/day for ATS Checker & Interview sessions
- **AI Endpoints**: 20 requests/hour for AI Enhance & Interview chat
- **Auth Endpoints**: 5 requests/15 minutes for login/register

## 📚 Documentation

- [ENV_SETUP.md](./ENV_SETUP.md) - Environment variables setup guide
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Detailed project structure
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Quick start guide

## 🚀 Deployment

### Frontend (Vercel)
- Build command: `npm run build`
- Output directory: `dist`

### Backend (Render / Railway)
- Build command: `npm install`
- Start command: `npm run server:dev` (dev) or `node api/server.js` (prod)

## 📝 License

MIT
