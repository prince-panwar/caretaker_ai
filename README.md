# CaretakerAI

An AI-powered healthcare chatbot that provides friendly, conversational health guidance through text and voice interfaces. Built with Next.js, Groq LLM, and Supabase authentication.

**Live Demo:** [caretaker-ai.vercel.app](https://caretaker-ai.vercel.app)

## Features

- **AI Health Advisor** -- Conversational healthcare guidance powered by Groq LLM (Llama 3.3 70B) with context-aware follow-up questions
- **Voice Chat** -- Speak naturally using your microphone with automatic silence detection, powered by Groq Whisper for transcription and Web Speech API for text-to-speech responses
- **Text Chat** -- Traditional chat interface with markdown formatting (code blocks, bold, lists)
- **Conversation Persistence** -- Chat history persists across page refreshes via localStorage
- **Dark Mode** -- Toggle between light and dark themes with preference saved locally
- **User Authentication** -- Secure email/password authentication via Supabase
- **Responsive Design** -- Optimized for both desktop and mobile devices

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| AI / LLM | Groq API (Llama 3.3 70B) via LangChain |
| Speech-to-Text | Groq Whisper Large V3 Turbo |
| Text-to-Speech | Web Speech API (browser-native) |
| Authentication | Supabase Auth |
| Styling | Tailwind CSS 3.4 |
| Deployment | Vercel |

## Project Structure

```
src/app/
  page.js                    Main chat interface (text + voice modes)
  login/page.js              Authentication page (sign up / sign in)
  layout.js                  Root layout with metadata and fonts
  globals.css                Global styles and dark mode variables
  clients/supabase.js        Supabase client initialization
  api/
    smartchat/route.ts       LLM chat endpoint (Groq + LangChain)
    voice/route.js           Audio transcription endpoint (Groq Whisper)
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Groq](https://console.groq.com/) API key
- A [Supabase](https://supabase.com/) project (for authentication)

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

   Copy the example file and fill in your keys:

   ```bash
   cp .env.example .env.local
   ```

   ```ini
   API_KEY=your_groq_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
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
  "id": "user_id"
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
3. Add environment variables (`API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy

## Disclaimer

CaretakerAI is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.

## License

This project is for educational and personal use.
