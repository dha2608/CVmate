# CV Mate - AI Career Ecosystem

CV Mate is an "All-in-one" career support platform powered by AI, designed to help users create ATS-friendly CVs and practice interviews with AI personas.

## Features

- **CV Builder**: Create professional CVs with real-time preview and AI text enhancement.
- **AI Interview Simulator**: Practice interviews with different AI personas (Friendly HR, Strict Manager, English Native).
- **Dashboard**: Track your career progress.
- **Authentication**: Secure user accounts.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn/UI, Zustand.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose).
- **AI**: OpenAI API (gpt-3.5-turbo / gpt-4o-mini).

## Getting Started

### Prerequisites

- Node.js installed.
- MongoDB instance (local or cloud).
- OpenAI API Key.

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    - Copy `.env.example` to `.env` (or create `.env` manually).
    - Fill in `MONGO_URI` and `OPENAI_API_KEY`.
    ```env
    PORT=3001
    MONGO_URI=mongodb://localhost:27017/cvmate
    JWT_SECRET=your_secret_key
    OPENAI_API_KEY=your_openai_key
    VITE_API_URL=http://localhost:3001/api
    ```

### Running the App

Start both frontend and backend in development mode:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Project Structure

- `src/`: Frontend React application.
- `api/`: Backend Express application.
- `src/components/ui`: Reusable UI components.
- `src/pages`: Application pages.
- `src/store`: State management (Zustand).

## License

MIT
