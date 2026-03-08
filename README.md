# AURA — Your AI Life Companion

![AURA Landing Page](https://github.com/user-attachments/assets/b7678128-0b69-468b-81c1-f9cf3565e086)

> Capture conversations, extract insights, and turn your life into a searchable AI-powered assistant.

## Overview

AURA is a production-grade MVP for an AI life companion designed for smart glasses and wearable devices. It captures voice/audio, transcribes speech, extracts structured data (tasks, appointments, people, places, ideas), and stores everything in a searchable memory timeline. Users can chat with an AI assistant that recalls their memories and push appointments directly to Google Calendar.

## Features

- 🎤 **Voice Recording** — Record audio directly in the browser or upload files
- 📝 **AI Transcription** — Powered by OpenAI Whisper
- 🧠 **Smart Extraction** — Auto-extracts tasks, appointments, people, places, and ideas using GPT-4o
- 🗂️ **Memory Timeline** — Searchable, paginated history of all captured conversations
- 💬 **AI Assistant** — Chat with AURA about your memories and life context
- ✅ **Task Management** — View, create, and complete tasks extracted from conversations
- 📅 **Appointments** — Review and confirm calendar events before pushing
- 📆 **Google Calendar Integration** — Push confirmed appointments with one click
- 🔒 **Privacy Controls** — Soft-delete individual memories; full account deletion

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| Backend    | Next.js API Routes                      |
| Database   | PostgreSQL + Prisma ORM 7 + pgvector    |
| Auth       | NextAuth v4 + Google OAuth              |
| AI         | OpenAI (Whisper, GPT-4o, embeddings)    |
| Calendar   | Google Calendar API v3                  |

## Project Structure

```
AURA/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── transcribe/           # Audio transcription + memory creation
│   │   ├── memories/             # Memory CRUD
│   │   ├── tasks/                # Task CRUD
│   │   ├── appointments/         # Appointment CRUD
│   │   ├── assistant/            # AI chat
│   │   ├── calendar/             # Google Calendar OAuth + event push
│   │   ├── integrations/         # Integration status
│   │   └── user/                 # Account management
│   ├── dashboard/                # Dashboard page
│   ├── memories/                 # Memory Timeline page
│   ├── assistant/                # AI Chat page
│   ├── tasks/                    # Tasks page
│   ├── appointments/             # Appointments page
│   ├── integrations/             # Integrations page
│   └── settings/                 # Settings page
├── components/
│   ├── ui/                       # Button, Card, Input, Badge
│   ├── layout/                   # AppShell, Sidebar, Header
│   └── features/                 # VoiceRecorder, AssistantChat, SignInButton
├── lib/
│   ├── auth.ts                   # NextAuth configuration + auth() helper
│   ├── prisma.ts                 # Prisma client singleton
│   └── utils.ts                  # Utility functions
├── services/
│   ├── openai.ts                 # OpenAI client
│   ├── transcription.ts          # Whisper transcription
│   ├── extraction.ts             # GPT-4o data extraction
│   ├── embeddings.ts             # Text embeddings
│   ├── assistant.ts              # AI assistant chat
│   └── calendar.ts               # Google Calendar integration
├── types/
│   ├── index.ts                  # Shared TypeScript types
│   └── next-auth.d.ts            # NextAuth session type augmentation
└── prisma/
    └── schema.prisma             # Database schema
```

## Database Models

- **User** — Authentication & profile (via NextAuth)
- **Device** — Registered devices (browser, smart glasses)
- **Memory** — Transcripts, summaries, metadata, embeddings
- **Task** — Extracted tasks with priority and status
- **Appointment** — Calendar events with confirmation workflow
- **CalendarToken** — Google OAuth tokens per user
- **AssistantMessage** — Conversation history with the AI

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ with pgvector extension
- Google Cloud project with OAuth & Calendar API enabled
- OpenAI API key

### Installation

```bash
# Clone the repo
git clone https://github.com/LawrenceHariri/AURA.git
cd AURA

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your values in .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

### Environment Variables

See [`.env.example`](.env.example) for all required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Random secret for NextAuth |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL |
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_MODEL` | Chat model (default: `gpt-4o`) |
| `OPENAI_EMBEDDING_MODEL` | Embedding model (default: `text-embedding-3-small`) |
| `OPENAI_WHISPER_MODEL` | Transcription model (default: `whisper-1`) |

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project and enable **Google Calendar API**
3. Create OAuth 2.0 credentials (Web application type)
4. Add `http://localhost:3000/api/auth/callback/google` to Authorized redirect URIs
5. Add `http://localhost:3000/api/calendar/callback` to Authorized redirect URIs

### Database Setup (PostgreSQL with pgvector)

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

Then run migrations:

```bash
npx prisma migrate dev --name init
```

## Usage

1. **Sign in** with your Google account
2. **Record** a conversation on the Dashboard
3. AURA automatically **transcribes** and **extracts** tasks, appointments, and metadata
4. Browse your **Memory Timeline** and search past conversations
5. Check **Tasks** and **Appointments** extracted from your recordings
6. **Chat with the AI assistant** about your memories
7. Connect **Google Calendar** in Integrations to push appointments

## Key Design Decisions

- **Never auto-push to calendar** — All appointments start as DRAFT and require user confirmation before being pushed to Google Calendar
- **Soft deletes** — Memories are soft-deleted (marked with `deletedAt`) to preserve data integrity
- **Modular AI services** — All AI functionality is abstracted in `/services` for easy swapping of providers
- **Server Components** — Dashboard and page-level data fetching use React Server Components for performance
- **Client Components** — Interactive features (recorder, chat, task list) are client components

## License

MIT
