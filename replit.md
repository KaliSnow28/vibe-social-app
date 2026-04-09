# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Main artifact is "Vibe" — a full-featured social media mobile app built with Expo/React Native.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Mobile**: Expo (React Native), expo-router (file-based routing)
- **UI**: expo-linear-gradient, @expo/vector-icons, react-native-reanimated
- **State**: React Context (AppContext, WalletContext, CharacterContext, PaymentsContext)
- **Persistence**: AsyncStorage
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Build**: esbuild (CJS bundle)

## App: Vibe (artifacts/mobile)

Feature-rich social media app combining Instagram + Snapchat + Facebook.

### Screens & Features
- **Feed** — posts, stories, emoji reactions, skeleton loaders, Tip buttons on every post
- **Explore** — search, trending creators (with tip buttons), hashtag challenges, viral reels, AI Characters
- **Camera** — filters, modes (Story/Reel/Photo/Video/Live → launches livestream)
- **Reels** — vertical video scroll
- **Messages** — conversations, voice messages, video call button
- **Profile** — grid, highlights, creator panel (wallet/dashboard/premium/AI Studio links), Monetize button → Creator Studio
- **AI Creative Studio** (`/ai-studio`) — unlimited image generation via Pollinations.ai, 12 style presets, 3 aspect ratios, content modes (Safe/Mature/18+ with age gate), negative prompts, generated gallery with post/save actions
- **AI Gallery** (`/ai-gallery`) — community AI showcase, grid/list views, post-to-feed/save
- **Notifications** — likes, comments, follows, mentions
- **Crypto Wallet** (`/wallet`) — BTC/ETH/USDC/SOL balances, send/receive, transaction history, daily claim
- **Video Call** (`/video-call/[id]`) — full-screen call UI, mute/camera/speaker/flip controls
- **Live Stream** (`/livestream`) — go live, viewer count, gifts, real-time chat, earnings tracker
- **Creator Dashboard** (`/creator-dashboard`) — weekly earnings bar chart, top content, payout history, payout methods
- **Premium** (`/premium`) — Free/Vibe+/Vibe Pro/Creator Elite tiers, monthly/annual billing toggle
- **AI Characters** (`/characters`, `/character-chat/[id]`) — chat with AI personas
- **Avatar Creator** (`/avatar-creator`) — emoji-based avatar builder

### Monetization Screens
- **Creator Studio** (`/creator-studio`) — earnings overview, tier management, auto-payouts toggle, links to sub-screens
- **Create Tier** (`/create-tier`) — form to create subscription tiers with pricing & perks
- **Subscribe** (`/subscribe`) — subscribe to a creator with tier picker and monthly/annual billing toggle
- **Send Tip** (`/send-tip`) — tip flow with preset amounts ($1, $5, $10, $20) and custom entry
- **Payout Accounts** (`/payout-accounts`) — manage PayPal/Venmo/Chime payout accounts
- **Earnings Dashboard** (`/earnings-dashboard`) — balance card, stats, manual payout, daily payout toggle
- **Payout History** (`/payout-history`) — transaction history list

### Context
- **AppContext** — posts (post-0..post-9), stories (story-0..story-9), conversations, me, AsyncStorage persistence
- **WalletContext** — crypto assets, transactions, subscription tier, send/earn/tip/subscribe
- **CharacterContext** — AI character list and chat history
- **PaymentsContext** — all payments state (earnings, tiers, subscriptions, payout accounts, notifications)

### Rules
- No `as any` casts
- No `textShadow` CSS strings, `pointerEvents` as JSX prop, or `useNativeDriver: true` for web animations (use `false`)
- Dynamic routes: typed route objects `{ pathname: "/route/[id]", params: { id } }`
- IDs: `Date.now().toString() + Math.random().toString(36).substr(2, 9)` (no uuid)
- Theme: primary `#E1306C`, accent `#833AB4`, dark mode supported

## API Server (artifacts/api-server)

Express 5 server running on port 8080. Routes:
- `GET /health` — health check
- `POST /api/ai/caption` — AI caption generation (OpenAI gpt-5.2)
- `POST /api/ai/generate-image` — AI image generation (OpenAI gpt-image-1)
- `POST /api/ai/hashtags` — AI hashtag generation (OpenAI gpt-5.2)
- `GET|POST /payments/*` — full payments API (see Payments section below)

Uses `@workspace/integrations-openai-ai-server` (lib/integrations-openai-ai-server) with Replit AI Integrations (AI_INTEGRATIONS_OPENAI_BASE_URL + AI_INTEGRATIONS_OPENAI_API_KEY).

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/mobile run typecheck` — typecheck mobile only
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Payments, Subscriptions & Daily Payouts

Full monetization layer powered by PayPal.

### Database Schema (lib/db/src/schema/payments.ts)
- `subscription_tiers` - creator-defined tiers with monthly/annual pricing
- `subscriptions` - fan subscriptions to creator tiers
- `donations` - one-time tips/donations
- `payout_accounts` - linked PayPal/Venmo/Chime accounts
- `earnings` - per-user balance tracking (total earned, available, pending, paid out)
- `payout_history` - record of all payout transactions
- `in_app_notifications` - payment-related in-app notifications

### API Routes (artifacts/api-server/src/routes/payments.ts)
All routes under `/payments/`:
- `GET /subscription-tiers/:creatorId` - list creator's tiers
- `POST /subscription-tiers` - create a new tier
- `PUT /subscription-tiers/:id` - update a tier
- `DELETE /subscription-tiers/:id` - deactivate a tier
- `POST /subscriptions/create` - subscribe to a creator
- `POST /subscriptions/:id/cancel` - cancel subscription
- `GET /subscriptions/user/:userId` - list user's subscriptions
- `POST /donations/create-order` - create a tip/donation
- `POST /donations/capture` - capture PayPal payment
- `GET /payout-accounts/:userId` - list payout accounts
- `POST /payout-accounts` - add a payout account
- `PUT /payout-accounts/:id/set-primary` - set primary account
- `DELETE /payout-accounts/:id` - remove account
- `GET /earnings/:userId` - get earnings summary
- `PUT /earnings/:userId/daily-payout` - toggle daily payout
- `GET /payout-history/:userId` - list payout history
- `POST /payouts/trigger` - manual payout trigger
- `POST /payouts/daily-cron` - daily cron job endpoint (protect with CRON_SECRET)
- `GET /notifications/:userId` - payment notifications
- `PUT /notifications/:id/read` - mark notification read
- `POST /webhooks/paypal` - PayPal webhook handler

### PayPal Integration (artifacts/api-server/src/lib/paypal.ts)
- OAuth token management with caching
- Subscription Plans & Products API
- Orders API (donations/tips)
- Payouts API (creator disbursements)
- Webhook event handling
- Simulation mode when credentials absent (payments complete immediately, no real money)

### Platform Fee
5% applied to all earnings. Example: $5 tip → $4.75 credited to creator.

### Environment Variables
- `PAYPAL_CLIENT_ID` — PayPal app client ID (sandbox or live)
- `PAYPAL_CLIENT_SECRET` — PayPal app secret
- `PAYPAL_WEBHOOK_ID` — for webhook signature verification (optional)
- `PAYPAL_MODE` — set to "live" for production (defaults to sandbox)
- `CRON_SECRET` — protects the daily cron endpoint (optional)
