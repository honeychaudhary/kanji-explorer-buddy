# 漢字 Kanji Explorer

> A modern, AI-powered web app for learning Japanese kanji — browse by JLPT level, study with stroke order and audio, track progress, and get personalized recommendations from an AI tutor.

**Live demo:** https://kanji-explorer-buddy.lovable.app

---

## Table of Contents

1. [Overview](#1-overview)
2. [Feature Catalog](#2-feature-catalog)
3. [Tech Stack](#3-tech-stack)
4. [System Architecture](#4-system-architecture)
5. [Folder Structure](#5-folder-structure)
6. [Routing Map](#6-routing-map)
7. [State Management](#7-state-management)
8. [Data Model & DB Schema](#8-data-model--db-schema)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Progress Tracking Flow](#10-progress-tracking-flow)
11. [AI Edge Functions](#11-ai-edge-functions)
12. [Security Posture](#12-security-posture)
13. [Sequence Diagrams](#13-sequence-diagrams)
14. [Local Development & Deployment](#14-local-development--deployment)
15. [Roadmap](#15-roadmap)

---

## 1. Overview

**Kanji Explorer** helps Japanese language learners — beginner through advanced — study kanji systematically. It pairs a curated kanji dataset with structured browsing (by JLPT level), interactive learning aids (stroke order animations, text-to-speech), and an AI layer that explains characters in plain language and tailors study sessions to the learner's history.

The app is a single-page React application that runs entirely in the browser, backed by Lovable Cloud (managed Postgres + Auth + Edge Functions) and the Lovable AI Gateway. It supports a **guest mode** (progress kept locally) and a **signed-in mode** (progress synced to the cloud).

**Target users:** self-studying language learners, JLPT candidates, classroom students who want a free study companion.

---

## 2. Feature Catalog

| Area | Feature | Where it lives |
|------|---------|----------------|
| Browsing | Searchable kanji explorer with filters | `src/components/KanjiExplorer.tsx` |
| Browsing | JLPT-level pages (N5 → N1) | `src/pages/JLPT.tsx` |
| Detail | Kanji detail dialog with meaning, readings, examples | `src/components/KanjiDetailDialog.tsx` |
| Detail | Stroke-order animation | `src/components/KanjiStrokeOrder.tsx` |
| Detail | Audio pronunciation (Web Speech API TTS) | `src/components/AudioButton.tsx`, `src/hooks/useTextToSpeech.ts` |
| Learning | Study/learn mode | `src/pages/Learn.tsx` |
| Progress | 4-stage status tracking: `new → learning → learned → mastered` | `src/hooks/useProgress.tsx`, `src/hooks/useSupabaseProgress.ts` |
| Progress | Stats dashboard | `src/pages/Progress.tsx` |
| Auth | Email/password sign up & sign in | `src/pages/Auth.tsx`, `src/hooks/useAuth.tsx` |
| Auth | Guest mode with local fallback | same |
| Profile | Display name, avatar, bio, study stats | `src/components/UserProfile.tsx` |
| AI | Per-kanji explanation (meaning, mnemonics, vocabulary) | `src/components/AIKanjiExplanation.tsx` + edge fn `ai-kanji-explanation` |
| AI | Personalized study recommendations | `src/components/AIStudyRecommendations.tsx` + edge fn `ai-study-recommendations` |
| UX | Sakura petal background, dark/light theming | `src/components/SakuraBackground.tsx`, `src/index.css` |

---

## 3. Tech Stack

**Frontend**

- **React 18** + **TypeScript 5** — component model and typing
- **Vite 5** — dev server + bundler
- **Tailwind CSS v3** — utility-first styling, semantic design tokens in `src/index.css`
- **shadcn/ui** + **Radix UI** — accessible component primitives
- **react-router-dom v6** — client-side routing
- **TanStack Query v5** — async cache for server state
- **lucide-react** — icon set
- **sonner** — toast notifications
- **react-hook-form** + **zod** — forms & validation
- **recharts** — progress charts

**Backend (Lovable Cloud, powered by Supabase under the hood)**

- **PostgreSQL** with Row-Level Security (RLS)
- **Auth** (email/password, JWT sessions)
- **Edge Functions** (Deno runtime) for AI calls

**AI**

- **Lovable AI Gateway** / OpenAI `gpt-4o-mini` for explanations and recommendations

---

## 4. System Architecture

```text
                ┌────────────────────────────────────────┐
                │          Browser (SPA)                 │
                │  React + Vite + Tailwind + shadcn/ui   │
                │                                        │
                │  AuthProvider ── ProgressProvider      │
                │  TanStack Query cache                  │
                └───────────┬────────────────────────────┘
                            │ HTTPS / JWT
              ┌─────────────┼──────────────────────────────┐
              │             │                              │
              ▼             ▼                              ▼
     ┌──────────────┐  ┌──────────────┐         ┌────────────────────┐
     │ Supabase     │  │ Supabase     │         │ Edge Functions     │
     │ Auth         │  │ Postgres     │ ◄─────► │ (Deno)             │
     │ (JWT)        │  │ + RLS        │ service │  ai-kanji-         │
     └──────────────┘  │  profiles    │  role   │   explanation      │
                       │  user_progress│        │  ai-study-         │
                       │  user_roles   │        │   recommendations  │
                       └──────────────┘         └─────────┬──────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │ AI Gateway /    │
                                                 │ OpenAI API      │
                                                 └─────────────────┘
```

**Key design choices**

- **Client-only app shell** — no SSR; the SPA is statically served.
- **Single source of truth for auth** — `AuthProvider` subscribes to Supabase `onAuthStateChange` and exposes `user`, `isGuest`, and sign-in/up/out actions.
- **Progress dual-mode** — `useProgress` for guest (in-memory/local), `useSupabaseProgress` for signed-in users (DB-synced upserts). The UI treats them uniformly.
- **AI logic stays server-side** — edge functions hold the API key; the client never sees it.

---

## 5. Folder Structure

```
src/
├── App.tsx                    # Providers + Router
├── main.tsx                   # ReactDOM entry
├── index.css                  # Design tokens (HSL semantic vars)
├── App.css
│
├── pages/                     # Route components
│   ├── Home.tsx               # Landing page
│   ├── Auth.tsx               # Sign in / sign up
│   ├── Learn.tsx              # Study/learn mode
│   ├── JLPT.tsx               # JLPT level browser (param :level)
│   ├── Progress.tsx           # User stats + AI recommendations
│   ├── Settings.tsx
│   ├── About.tsx
│   ├── Index.tsx
│   └── NotFound.tsx
│
├── components/
│   ├── Navigation.tsx
│   ├── AuthMenu.tsx
│   ├── UserProfile.tsx
│   ├── SakuraBackground.tsx
│   ├── KanjiExplorer.tsx      # Search + grid
│   ├── KanjiDetailDialog.tsx  # Modal with full kanji info
│   ├── KanjiStrokeOrder.tsx
│   ├── AudioButton.tsx
│   ├── AIKanjiExplanation.tsx
│   ├── AIStudyRecommendations.tsx
│   └── ui/                    # shadcn primitives
│
├── hooks/
│   ├── useAuth.tsx            # Auth context (Supabase session)
│   ├── useProgress.tsx        # Guest progress (local)
│   ├── useSupabaseProgress.ts # Signed-in progress (DB)
│   ├── useKanjiData.ts        # Kanji dataset access
│   ├── useTextToSpeech.ts     # Web Speech API wrapper
│   └── use-mobile.tsx
│
├── integrations/supabase/
│   ├── client.ts              # Supabase JS client (singleton)
│   └── types.ts               # Generated DB types
│
├── lib/
│   ├── supabaseClient.ts      # Optional client accessor (guest-safe)
│   └── utils.ts               # cn() helper, misc
│
├── data/kanji.ts              # Bundled kanji dataset
└── types/kanji.ts             # Kanji TypeScript types

supabase/
├── config.toml                # Edge function settings (verify_jwt flags)
├── functions/
│   ├── ai-kanji-explanation/index.ts
│   └── ai-study-recommendations/index.ts
└── migrations/                # SQL schema migrations
```

---

## 6. Routing Map

| Path | Component | Notes |
|------|-----------|-------|
| `/` | `Home` | Landing page, entry to study modes |
| `/auth` | `Auth` | Sign in / sign up |
| `/learn` | `Learn` | Study mode |
| `/jlpt/:level` | `JLPT` | Dynamic JLPT level (e.g. `/jlpt/N5`) |
| `/progress` | `Progress` | Stats + AI recommendations |
| `/settings` | `Settings` | User settings |
| `/about` | `About` | Info page |
| `*` | `NotFound` | 404 fallback |

All routes are mounted inside `AuthProvider` → `ProgressProvider` → `TooltipProvider` in `src/App.tsx`.

---

## 7. State Management

State is intentionally split by lifetime and ownership:

| State | Scope | Owner | Persistence |
|-------|-------|-------|-------------|
| Auth session | App-wide | `AuthProvider` (`useAuth.tsx`) | Supabase JWT (cookie/localStorage) |
| Guest progress | App-wide | `ProgressProvider` (`useProgress.tsx`) | In-memory (extendable to localStorage) |
| Synced progress | Per signed-in user | `useSupabaseProgress.ts` | Postgres `user_progress` |
| Server cache | Per query key | TanStack Query | In-memory cache |
| Form state | Per form | `react-hook-form` | Component-local |
| UI state (modals etc.) | Per component | `useState` | Component-local |

The `useAuth` hook is the gatekeeper: components branch on `user` vs `isGuest` to decide whether to call the Supabase-backed hook or the local one.

---

## 8. Data Model & DB Schema

Three tables underpin the app, all with **Row-Level Security (RLS) enabled**.

### `profiles`
One row per user, created automatically on signup via a trigger.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid | FK → `auth.users.id`, unique |
| `display_name` | text | |
| `avatar_url` | text | |
| `bio` | text | |
| `total_kanji_learned` | int | Denormalized counter |
| `current_streak` | int | |
| `last_study_date` | date | |
| `preferred_jlpt_level` | text | e.g. `N5` |
| `created_at`, `updated_at` | timestamptz | |

**RLS policies:**
- `SELECT` — owner only (`auth.uid() = user_id`)
- `INSERT` / `UPDATE` — owner only

### `user_progress`
One row per (user, kanji) pair.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid | FK → `auth.users.id` |
| `kanji` | text | The character itself |
| `status` | text | `new` \| `learning` \| `learned` \| `mastered` |
| `times_reviewed` | int | |
| `difficulty_score` | int | 0–100, drives "struggling" detection |
| `last_reviewed_at` | timestamptz | |
| Unique `(user_id, kanji)` | | enables upsert |

**RLS:** owner-only for all CRUD.

### `user_roles` (+ enum `app_role`)
Roles are stored separately from `profiles` to prevent privilege escalation.

```sql
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
```

A `SECURITY DEFINER` function avoids recursive RLS:

```sql
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;
```

---

## 9. Authentication & Authorization

**Sign-up flow**

1. User submits email + password on `/auth`.
2. `useAuth.signUp` calls `supabase.auth.signUp`.
3. A DB trigger inserts a matching row in `profiles`.
4. Supabase emits `SIGNED_IN`; `onAuthStateChange` updates the React context.

**Session lifecycle**

- On mount, `AuthProvider` calls `getSession()` once and subscribes to `onAuthStateChange`.
- `user` is exposed via `useAuth()`. `isGuest = !user`.
- Sign-out clears the session and the dependent hooks (e.g. `useSupabaseProgress` resets to `{}`).

**Authorization** is enforced at the database via RLS, not in the client. Even a tampered client cannot read another user's data.

---

## 10. Progress Tracking Flow

```text
User reviews kanji
      │
      ▼
updateProgress(kanji, status, difficultyScore)
      │
      ├── guest? ── update local React state ── done
      │
      └── signed-in?
              │
              ▼
        supabase.from('user_progress').upsert({...})
              │
              ▼
        update local state for instant UI
              │
              ▼
        updateProfileStats() ── recompute total_kanji_learned
              │
              ▼
        UI re-renders (Progress page, badges, etc.)
```

Computed stats live in `getStats()` and aggregate across all four statuses for charts and counters.

---

## 11. AI Edge Functions

Two Deno functions live under `supabase/functions/` and are configured in `supabase/config.toml`:

```toml
[functions.ai-kanji-explanation]
verify_jwt = false        # public — anyone can request an explanation

[functions.ai-study-recommendations]
verify_jwt = true         # authenticated only — uses user data
```

### `ai-kanji-explanation`

- **Input:** `{ kanji: string, context?: string }`
- **Output:** `{ kanji, explanation: string, timestamp }`
- **Behavior:** Builds a structured prompt asking for meaning, readings, stroke count, radicals, vocabulary, mnemonics, and JLPT level. Calls `gpt-4o-mini`.

### `ai-study-recommendations`

- **Input:** `{ userId, jlptLevel?, studyGoal? }`
- **Output:** `{ recommendations, progressSummary, jlptLevel, timestamp }`
- **Behavior:** Uses the **service role** to read the user's `user_progress` and `profiles` rows, summarizes them (totals, struggling count, streak), and asks the model for tailored recommendations and an estimated study time.

Secrets used (set via Lovable Cloud → Secrets, never committed):

| Secret | Used by |
|--------|---------|
| `OPENAI_API_KEY` | both functions |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | `ai-study-recommendations` |

---

## 12. Security Posture

- **RLS everywhere** — `profiles`, `user_progress`, `user_roles` all enable RLS with owner-only policies. The `profiles` table SELECT policy is restricted to the owner so personal info (display name, avatar, bio) cannot be scraped.
- **Roles in a separate table** — never on `profiles`. Role checks go through `has_role()` (SECURITY DEFINER, locked `search_path`) to prevent recursive policy evaluation and privilege escalation.
- **Server-held secrets** — API keys live in Edge Function env vars; the client only ever holds the publishable anon key.
- **JWT-gated AI** — `ai-study-recommendations` requires a valid JWT (`verify_jwt = true`) since it operates on per-user data.
- **Client never trusted for authz** — the UI hides admin features when applicable, but DB policies are the actual enforcement layer.
- **Known config note** — Auth OTP expiry is a Supabase project-level setting; tune it in the dashboard rather than via code.

---

## 13. Sequence Diagrams

### Sign-up

```text
User ──► Auth.tsx ──► useAuth.signUp ──► Supabase Auth
                                              │
                                              ├─► insert into auth.users
                                              ├─► trigger ─► insert into profiles
                                              └─► emit SIGNED_IN
                                                      │
                                          AuthProvider.onAuthStateChange
                                                      │
                                                React context update
                                                      │
                                                UI re-renders
```

### Kanji review (signed-in)

```text
User clicks "Mark as Learned"
        │
KanjiDetailDialog ──► useSupabaseProgress.updateProgress
        │
        ├─► supabase.upsert(user_progress)   ── RLS: owner-only
        ├─► setProgress(local)               ── instant UI
        └─► supabase.update(profiles)        ── total_kanji_learned
                │
        Progress.tsx re-renders with new stats
```

### AI explanation

```text
KanjiDetailDialog ──► AIKanjiExplanation
        │
        └─► supabase.functions.invoke('ai-kanji-explanation', { kanji })
                │
        Edge Function (Deno)
                │
                └─► OpenAI gpt-4o-mini
                        │
                ◄─── explanation text
        ◄─── { kanji, explanation, timestamp }
        │
        Render markdown-ish content in the dialog
```

---

## 14. Local Development & Deployment

### Prerequisites

- Node.js 18+
- npm (or bun)

### Run locally

```bash
npm install
npm run dev
```

The dev server starts on `http://localhost:8080` (Vite).

### Environment

Lovable Cloud auto-provisions env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) and edge-function secrets. For local dev outside Lovable, copy `.env.example` (if present) to `.env`.

### Build

```bash
npm run build       # production
npm run build:dev   # dev-mode build for debugging
npm run preview     # serve the build
```

### Deploy

Push via the Lovable editor → click **Publish**. The published URL is:
`https://kanji-explorer-buddy.lovable.app`

---

## 15. Roadmap

Ideas worth exploring next:

- **SRS (spaced repetition)** scheduling on top of `user_progress.difficulty_score` and `last_reviewed_at`.
- **Offline mode / PWA** — service worker + cached kanji dataset.
- **Writing practice** — canvas input compared to stroke order.
- **Social** — friends, leaderboards (requires public-but-limited profile fields, behind explicit opt-in).
- **Export progress** — CSV/JSON download from the Progress page.
- **Mobile** — Capacitor wrapper for iOS/Android.
- **Internationalization** — UI strings for non-English speakers.

---

_Documentation generated for the Kanji Explorer codebase. For questions or contributions, open the project in Lovable and edit away._
