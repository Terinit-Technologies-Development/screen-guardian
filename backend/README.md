# Screen Guardian — Backend

This directory contains the backend infrastructure for Screen Guardian's cloud sync and AI features, powered by **Supabase**.

## Stack

| Layer | Technology |
|---|---|
| Database | Supabase Postgres |
| Auth | Supabase Auth (email + OAuth) |
| Storage | Supabase Storage |
| Edge Functions | Deno-based Edge Functions |
| AI Integration | Edge functions calling AI APIs (OpenAI / Gemini) |

## Directory Structure

```
backend/
├── README.md                         # This file
└── supabase/
    ├── config.toml                   # Supabase CLI project config
    ├── migrations/                   # SQL schema migrations (run in order)
    │   └── 001_initial_schema.sql    # Users, usage, limits, sessions
    └── functions/                    # Supabase Edge Functions (Deno)
        └── sync-usage/
            └── index.ts              # Cloud sync endpoint for daily usage data
```

## Setup

### Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) — `npm install -g supabase`
- A Supabase account and project at [supabase.com](https://supabase.com)

### 1. Link your Supabase project

```bash
cd backend
supabase login
supabase link --project-ref <your-project-ref>
```

### 2. Apply the database migrations

```bash
supabase db push
```

### 3. Deploy Edge Functions

```bash
supabase functions deploy sync-usage
```

### 4. Set your environment variables

Fill in the relevant values in the root `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Planned Features

- **Cloud Sync**: Sync daily usage snapshots and app limits across devices.
- **AI Insights**: Analyse usage patterns and generate personalised focus recommendations.
- **Streak Tracking**: Server-side tracking of daily goals and streaks.
- **Remote Config**: Server-driven configuration for limit recommendations.
