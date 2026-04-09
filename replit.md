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
- **State**: React Context (AppContext, WalletContext, CharacterContext)
- **Persistence**: AsyncStorage

## App: Vibe (artifacts/mobile)

Feature-rich social media app combining Instagram + Snapchat + Facebook.

### Screens & Features
- **Feed** — posts, stories, emoji reactions, skeleton loaders
- **Explore** — search, trending creators (with tip buttons), hashtag challenges, viral reels, AI Characters
- **Camera** — filters, modes (Story/Reel/Photo/Video/Live → launches livestream)
- **Reels** — vertical video scroll
- **Messages** — conversations, voice messages, video call button
- **Profile** — grid, highlights, creator panel (wallet/dashboard/premium links)
- **Notifications** — likes, comments, follows, mentions
- **Crypto Wallet** (`/wallet`) — BTC/ETH/USDC/SOL balances, send/receive, transaction history, daily claim
- **Video Call** (`/video-call/[id]`) — full-screen call UI, mute/camera/speaker/flip controls
- **Live Stream** (`/livestream`) — go live, viewer count, gifts, real-time chat, earnings tracker
- **Creator Dashboard** (`/creator-dashboard`) — weekly earnings bar chart, top content, payout history, payout methods
- **Premium** (`/premium`) — Free/Vibe+/Vibe Pro/Creator Elite tiers, monthly/annual billing toggle
- **AI Characters** (`/characters`, `/character-chat/[id]`) — chat with AI personas
- **Avatar Creator** (`/avatar-creator`) — emoji-based avatar builder

### Context
- **AppContext** — posts (post-0..post-9), stories (story-0..story-9), conversations, me, AsyncStorage persistence
- **WalletContext** — crypto assets, transactions, subscription tier, send/earn/tip/subscribe
- **CharacterContext** — AI character list and chat history

### Rules
- No `as any` casts
- No `textShadow` CSS strings, `pointerEvents` as JSX prop, or `useNativeDriver: true` for web animations (use `false`)
- Dynamic routes: typed route objects `{ pathname: "/route/[id]", params: { id } }`
- IDs: `Date.now().toString() + Math.random().toString(36).substr(2, 9)` (no uuid)
- Theme: primary `#E1306C`, accent `#833AB4`, dark mode supported

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/mobile run typecheck` — typecheck mobile only
