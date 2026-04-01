# CaretakerAI

An AI-powered healthcare chatbot that provides friendly, conversational health guidance through text and voice interfaces. Built with Next.js, Groq LLM, and NextAuth.js — fully self-contained with zero external database dependencies.

**Live Demo:** [caretaker-ai.vercel.app](https://caretaker-ai.vercel.app)

## Features

- **AI Health Advisor** -- Conversational healthcare guidance powered by Groq LLM (Llama 4 Scout) with context-aware follow-up questions
- **Voice Chat** -- Speak naturally using your microphone with automatic silence detection, powered by Groq Whisper for transcription and Web Speech API for text-to-speech responses
- **Text Chat** -- Traditional chat interface with markdown formatting (code blocks, bold, lists)
- **Conversation Persistence** -- Chat history persists across page refreshes via localStorage
- **Dark Mode** -- Toggle between light and dark themes with preference saved locally
- **Stateless Authentication** -- JWT-based auth via NextAuth.js — no database required, never pauses or goes down
- **Responsive Design** -- Optimized for both desktop and mobile devices

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| AI / LLM | Groq API (Llama 4 Scout) via LangChain |
| Speech-to-Text | Groq Whisper Large V3 Turbo |
| Text-to-Speech | Web Speech API (browser-native) |
| Authentication | NextAuth.js (JWT sessions, no DB) |
| Styling | Tailwind CSS 3.4 |
| Deployment | Vercel |

## Project Structure

```
src/app/
  page.js                    Main chat interface (text + voice modes)
  login/page.js              Authentication page
  layout.js                  Root layout with metadata and fonts
  globals.css                Global styles and dark mode variables
  components/
    SessionWrapper.js        NextAuth session provider
  api/
    auth/[...nextauth]/      NextAuth.js API route (JWT auth)
    smartchat/route.ts       LLM chat endpoint (Groq + LangChain)
    voice/route.js           Audio transcription endpoint (Groq Whisper)
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Groq](https://console.groq.com/) API key

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/prince-panwar/caretaker_ai.git
   cd caretaker_ai
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   ```ini
   API_KEY=your_groq_api_key
   NEXTAUTH_SECRET=your_random_secret    # generate with: openssl rand -base64 32
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### POST /api/smartchat

Conversational health advisor with full chat history context.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "I have a headache" },
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "It started yesterday" }
  ],
  "id": "user_email"
}
```

**Response:**
```json
{
  "message": "AI response text"
}
```

### POST /api/voice

Audio transcription via Groq Whisper.

**Request:** `multipart/form-data` with an audio file field named `file` (WebM format)

**Response:**
```json
{
  "text": "transcribed text"
}
```

## Deployment

Deploy to Vercel with one click:

1. Push your code to GitHub
2. Import the repository on [vercel.com](https://vercel.com)
3. Add environment variables:
   - `API_KEY` -- your Groq API key
   - `NEXTAUTH_SECRET` -- a random secret (`openssl rand -base64 32`)
   - `NEXTAUTH_URL` -- your production URL (e.g., `https://caretaker-ai.vercel.app`)
4. Deploy

## Disclaimer

CaretakerAI is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.

## License

This project is for educational and personal use.
