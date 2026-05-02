# Kanji Explorer — Detailed Project Documentation

You asked for a "detailed src" — I'll interpret that as a detailed **doc** for the project. Since you didn't pick a format, I'll deliver both:

1. A rich **`README.md`** committed to the repo (replacing the current 1-line README).
2. A polished **PDF** version (`/mnt/documents/Kanji_Explorer_Documentation.pdf`) you can share/download.
3. A **Mermaid architecture diagram** artifact for visual reference.

Depth target: **detailed technical doc** (~4–6 pages of content).

---

## What the documentation will cover

1. **Project overview** — what Kanji Explorer is, target users, value prop.
2. **Feature catalog**
   - Kanji explorer & detail dialog (stroke order, audio TTS)
   - JLPT level browsing (N5–N1)
   - Learn / study mode
   - Progress tracking with statuses (new → learning → learned → mastered)
   - Auth (email/password via Supabase) with guest fallback
   - User profile (display name, avatar, bio, study stats)
   - AI-powered kanji explanations (edge function)
   - AI-powered personalized study recommendations (edge function)
   - Sakura background, theming
3. **Tech stack** — React 18, Vite 5, TypeScript, Tailwind v3, shadcn/ui, Radix, react-router, TanStack Query, Supabase (auth + Postgres + Edge Functions), Lovable AI Gateway.
4. **System architecture** — client/SPA, Supabase backend, edge functions, AI gateway. Mermaid diagram.
5. **Folder structure** — annotated tree of `src/` (pages, components, hooks, integrations, lib, data, types) and `supabase/` (functions, migrations, config).
6. **Routing map** — every route in `App.tsx` and what it renders.
7. **State management**
   - `AuthProvider` (session + sign in/up/out)
   - `ProgressProvider` (local/guest progress)
   - `useSupabaseProgress` (server-synced progress for logged-in users)
   - TanStack Query for async caching
8. **Data model / DB schema** — tables: `profiles`, `user_progress`, `user_roles` (+ enum `app_role`), with RLS policies and the `has_role` security-definer function.
9. **Authentication & authorization flow** — signup → trigger creates profile → session via `onAuthStateChange` → RLS enforces per-user access.
10. **Progress tracking flow** — review event → `updateProgress` upsert → `profiles.total_kanji_learned` recomputed → UI re-render.
11. **AI edge functions**
    - `ai-kanji-explanation` (verify_jwt = false, public)
    - `ai-study-recommendations` (verify_jwt = true, authenticated)
    - Request/response shape, where they're called from, model gateway usage.
12. **Security posture** — RLS-only access, profiles restricted to owner SELECT, roles in dedicated table (no privilege escalation), security-definer functions with locked `search_path`, secrets via Supabase, OTP expiry note.
13. **Sequence diagrams** (Mermaid) for: sign-up, kanji review, AI explanation request.
14. **Local dev & deployment** — `npm i`, `npm run dev`, env via Lovable Cloud, deploying via Lovable.
15. **Future roadmap suggestions** — SRS scheduling, offline mode, social features, mobile PWA.

## Files I'll change/create

- **edit** `README.md` — replace stub with full documentation.
- **create** `docs/ARCHITECTURE.md` — the same long-form doc, kept under `docs/` for discoverability.
- **create** `/mnt/documents/Kanji_Explorer_Documentation.pdf` — generated via a one-off script (markdown → HTML → PDF via headless tool), QA'd page-by-page.
- **create** `/mnt/documents/Kanji_Explorer_Architecture.mmd` — Mermaid diagram artifact.

## Technical notes (how I'll build the PDF)

- Write the doc as Markdown, convert to HTML with a small Node script, then render to PDF using a headless renderer available in the sandbox (pandoc + a PDF engine, or a JS-based renderer). Fall back to a plain pandoc → PDF pipeline if needed.
- After generation, rasterize each page to JPEG and visually inspect for clipped text, broken layout, missing fonts before delivering. Iterate if issues are found.
- No code in the app changes — this is documentation only, so existing functionality is unaffected.

## Out of scope

- No app feature changes, no schema changes, no new routes.
- No edits to AI prompts or edge function logic.

Approve this and I'll generate the README, the architecture doc, the Mermaid diagram, and the PDF in one pass.