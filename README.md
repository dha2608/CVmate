# CV Mate - AI Career Ecosystem

CV Mate is an all-in-one AI-powered career platform designed to help users create ATS-friendly CVs in under 5 minutes and practice interviews through intelligent AI personas.

---

## Features

### Authentication & Onboarding

- Email / Password authentication  
- Google OAuth 2.0 integration  
- Guided onboarding flow to define career goals:
  - New Job  
  - Internship  
  - Career Switch  

---

### CV Builder (Core Feature)

- ATS-friendly templates (minimal, recruiter-optimized layouts)  
- AI Enhance: Transform raw bullet points into professional, impact-driven language  
- ATS Checker: Compare CV with Job Description and receive keyword optimization suggestions  
- PDF Export: Download selectable PDF using jsPDF  
- Template Selector: Multiple professional layouts  
- Section Reordering: Drag & drop CV sections  
- AI Suggestions: Smart, context-aware content recommendations  

---

### AI Interview Simulator (Flagship Feature)

**Available AI Personas**

- Friendly HR — Focus on culture fit and soft skills  
- Strict Manager — Technical challenges and problem-solving  
- English Native — Language proficiency evaluation  

**Capabilities**

- Speech-to-Text using Web Speech API  
- Real-time feedback and scoring  
- Confidence analysis  
- Accuracy evaluation  
- Personalized improvement suggestions  

---

### Community Hub

- Newsfeed for sharing career-related posts  
- CV sharing with sensitive information hidden  
- Like and comment interactions for peer feedback  

---

### Career Blog

- Admin CMS for article creation and management  
- AI-powered article summary generation  

---

### Job Search

- Browse and search job listings  
- AI Job Matcher: Match CV with job descriptions  
- Bookmark system for saving preferred jobs  

---

## Tech Stack

**Frontend**

- React 18 + Vite  
- TypeScript  
- Tailwind CSS  
- Shadcn/UI  
- Zustand  
- Framer Motion  

**Backend**

- Node.js  
- Express.js  
- MongoDB (Mongoose)  

**AI**

- Hugging Face Inference API (Llama 3 / open-source LLMs)  

**Authentication**

- JWT  
- Google OAuth 2.0 (Passport.js)  

**Other Integrations**

- jsPDF + html2canvas (PDF export)  
- Web Speech API (browser-native speech recognition)  
- Vercel (Frontend deployment)  
- Render (Backend deployment)  
- Zustand persistence for state management  
- Custom UI components with glassmorphism design  

---

## Getting Started

### Prerequisites

- Node.js 18+  
- MongoDB instance (local or MongoDB Atlas)  
- Hugging Face API Token (`HF_API_KEY`)  
- Google OAuth 2.0 credentials (optional)  

---

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd CVmate
