# Kanji Explorer Buddy — Premium Platform Rollout

This is a very large scope. To ship safely without breaking the existing UI, I'll split it into 4 phases. Please confirm the phase order (or tell me to start with a different one) before I begin coding.

## Phase 1 — Monetization (Stripe + paywall)
**Goal:** money in, gating working, ads only for free users.

- New tables: `subscriptions` (user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end), `payments` (user_id, amount, currency, stripe_payment_id, plan, status), `daily_audio_usage` (user_id, date, count). RLS: user reads own; service role writes from webhooks.
- Edge functions (all use Stripe secret + webhook secret you'll add):
  - `create-checkout` — creates Stripe Checkout session for Pro (₹79 INR subscription) or Lifetime (₹790 INR one-time).
  - `stripe-webhook` (verify_jwt=false) — handles `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated/deleted`; upserts `subscriptions` and inserts `payments`. Updates `profiles.subscription_plan`.
  - `customer-portal` — Stripe billing portal session.
  - `check-subscription` — returns current plan/status for the logged-in user.
- Frontend:
  - `/pricing` page (3 cards: Free, Pro ₹79/mo, Lifetime ₹790).
  - `/upgrade` (CTA wrapper around Pricing).
  - `/billing` (current plan, manage via portal, payment history).
  - Profile page: show current plan badge.
  - `useSubscription()` hook (TanStack Query) — single source of truth.
  - AudioButton: free-tier daily limit of 5 (RPC `increment_audio_play` with date reset). Show toast "You have reached today's free limit. Upgrade to Pro for unlimited pronunciation audio." with Upgrade button.
- Ads:
  - `<AdSlot variant="in-content" />` and `<StickyFooterAd />` components. Only render when `plan === 'free'`. Pro/Lifetime see nothing.
- Secrets needed from you: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PRO`, `STRIPE_PRICE_ID_LIFETIME` (I'll request via add_secret).

## Phase 2 — Learning dashboard + AI Sensei (Pro/Lifetime)
- Tables: `user_xp` (xp, level), `streaks` (current, longest, last_active), `achievements` + `user_achievements`, `favorites` (kanji), `learning_history` (kanji, viewed_at), `sensei_conversations` + `sensei_messages`.
- `/dashboard`: streak ring, XP bar (levels 1–100 via `floor(sqrt(xp/50))+1`), achievements grid, favorites, history, weekly stats chart, study calendar heatmap, progress %.
- Favorite ⭐ button on KanjiDetailDialog; auto-log to `learning_history`; award XP on first view per day; update streak.
- `/sensei`: chat UI gated to Pro/Lifetime. Edge function `ai-sensei` using Lovable AI Gateway (`google/gemini-3-flash-preview`), streaming, system prompt structured for Meaning / Onyomi / Kunyomi / Stroke count / Example words / Sentences / Mnemonics. Persists conversations.

## Phase 3 — SEO landing pages
Static pages with React Helmet (canonical, OG, JSON-LD `LearningResource`/`BreadcrumbList`):
- `/jlpt-n5-kanji`, `/jlpt-n4-kanji`, `/jlpt-n3-kanji`, `/jlpt-n2-kanji`, `/jlpt-n1-kanji`
- `/hiragana-chart`, `/katakana-chart`
- `/common-japanese-words`, `/stroke-order-guide`
Each renders real content from existing kana/kanji data so they're indexable, not thin. Update `sitemap.xml` + `robots.txt`.

## Phase 4 — Study tools + admin upgrade
- Flashcards (SRS-lite), JLPT mock tests, vocab quizzes, daily word challenge, search history page, recommendations (reuse existing `ai-study-recommendations`), progress reports, dark mode toggle, leaderboards (`public_leaderboard` view of XP).
- Email reminders + push notifications: scaffold opt-in UI + a scheduled edge function stub. **Real delivery requires Resend (email) and a push service (VAPID/OneSignal). I'll ask for those keys when we reach this phase.**
- Admin dashboard additions: monthly revenue (sum payments), daily traffic, retention cohort, conversion rate (paid/total). Charts via Recharts.

## Technical notes
- All new tables: `GRANT` + RLS + policies in the same migration. Webhooks use service role.
- All edge functions: JWT verification on user-scoped ones, input validation (Zod), generic error responses (per @security-memory).
- TanStack Query everywhere for loading/error states. Skeletons preserved.
- No redesign of existing pages — only additive routes/components. Navigation gets new links: Pricing, Dashboard, Sensei.
- Stripe in INR: confirm your Stripe account supports INR; if not, we'll switch currency.

## What I need from you to start Phase 1
1. Confirm phased order is OK (or pick a different starting phase).
2. Confirm Stripe account is set up for INR.
3. Ready to provide `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` when prompted, plus create the two Stripe prices (or let me create them programmatically on first checkout).

Reply "go" to start Phase 1, or tell me which phase to start with.
