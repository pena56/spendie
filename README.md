# SPENDIE - Gamified Expense Tracker

[![Convex](https://img.shields.io/badge/Powered%20by-Convex-blue)](https://convex.dev) [![TanStack](https://img.shields.io/badge/Built%20with-TanStack%20Start-orange)](https://tanstack.com/start)

**SPENDIE** is a web app for tracking expenses, splitting bills, and gamifying your finances. Built for a hackathon sponsored by Convex, CodeRabbit, Firecrawl, Netlify, Autumn, Sentry, and Cloudflare. **SPENDIE** turns money management into an addictive game: Earn XP for logging spends, unlock achievements, and snag rewards like avatar and frames. AI-powered voice/scan inputs, real-time social splits, and personalized insights make it effortless and fun.

Home Page

![Home page screenshot](./image.png)

## 🚀 Features

- **Smart Tracking:** Log income/expenses manually, via voice (Web Speech API), or scan receipts (Gemini Vision API). Auto-categorize with AI.
- **Budgeting Magic:** Set flexible periods (daily/weekly/monthly), track progress with colorful bars.
- **Social Splits:** Create group bills, invite via user search, accept/settle individually (partial payments supported). Real-time balances.
- **AI Insights:** Personalized tips (e.g., "Cut food by 20%") pulled from articles from [Bankrate](https://www.bankrate.com/personal-finance/) via Firecrawl + Gemini.
- **Achievements & Perks:** 15 achievements. Level up every 500 XP; equip rewards in profile.

Built for speed and scalability: Real-time sync via Convex, queries/mutations with TanStack Query.

## 🛠 Tech Stack

| Category       | Tools                                                             |
| -------------- | ----------------------------------------------------------------- |
| **Frontend**   | TanStack Start (React, Query, Router), Tailwind CSS, Lucide Icons |
| **Backend/DB** | Convex (schema, auth, realtime, scheduler, workflows)             |
| **AI/ML**      | Google Gemini (vision/text via Vercel AI SDK)                     |
| **Scraping**   | Firecrawl                                                         |
| **Voice**      | Web Speech API                                                    |
| **Forms**      | TanStack Form + Zod validation                                    |
| **UI**         | Shadcn/UI                                                         |
| **Deployment** | Cloudflare (frontend), Convex Dashboard (backend)                 |

## 📦 Local Setup

Get SPENDIE running in <5 minutes. Requires Node.js 18+.

### Prerequisites

- [Node.js](https://nodejs.org) (v18+)
- [Convex CLI](https://www.npmjs.com/package/convex): `npm i -g convex`

- API Keys:
  - **Gemini:** Get from [Google AI Studio](https://aistudio.google.com/app/apikey) (free tier OK).
  - **Firecrawl:** Sign up at [firecrawl.dev](https://firecrawl.dev) for API key.
  - **Sentry:** Sign up at [sentry.io](https://sentry.io) for API key.

### 1. Clone & Install

```bash
git clone https://github.com/pena56/spendie
cd spendie
pnpm install
```

### 2. Set Up Environment

Create `.env.local` in root:

```
# Deployment used by `npx convex dev`
CONVEX_DEPLOYMENT=after_convex_init

VITE_CONVEX_URL=after_convex_init

SENTRY_AUTH_TOKEN=your_sentry_auth_token

GEMINI_API_KEY=your_gemini_api_key

GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

FIRECRAWL_API_KEY=your_firecrawl_api_key
```

### 3. Initialize Convex Backend

```bash
npx convex dev  # Starts local dev server (http://127.0.0.1:3180)
# Auto-creates project; follow prompts for auth (email/password setup)
```

- Seed data (optional): Run `npx convex run achievements:seedAchievements` for demo achievements.

### 4. Run Development Server

```bash
pnpm run dev  # Starts TanStack Start at http://localhost:3000
```

- Open in browser; sign up/login to test.
- Voice/scan: Grant mic/camera perms.

### 5. Scripts

| Command              | Description          |
| -------------------- | -------------------- |
| `pnpm run dev`       | Local dev server     |
| `pnpm run build`     | Build for prod       |
| `pnpm run preview`   | Preview built app    |
| `npx convex dev`     | Local Convex backend |
| `npx convex deploy`  | Deploy backend       |
| `npx convex codegen` | Regen TS types       |

### Troubleshooting

- **API Errors:** Check `.env` keys; verify in Convex dashboard.
- **Auth:** Uses Convex Auth—email/password.
- Logs: Convex dashboard for backend; browser console for frontend.

## 🌐 Deployment

### Backend (Convex)

1. `npx convex deploy` → Deploys to cloud.

### Frontend (Cloudflare)

1. Push to GitHub.
2. Setup Wrangler and run deploy script.
3. Add env vars (GEMINI/FIRECRAWL keys).
4. Deploy: Auto on push; preview branches.

## 🔑 API Keys & Integrations

| Service       | Key/Setup     | Usage                        |
| ------------- | ------------- | ---------------------------- |
| **Convex**    | Auto-init     | DB, auth, realtime           |
| **Gemini**    | AI Studio key | Voice/scan parsing, insights |
| **Firecrawl** | Dashboard key | Scrape tips                  |
| **Sentry**    | API key       | Error monitoring             |

Free tiers suffice for hackathon/demo.

## 🎮 Gamification

- **XP Sources:** Login (+50), Txn (+10), Split settle (+20), Goal contrib (+15).
- **Achievements:** 15.
- **Rewards:** Avatars, frames — equip in Profile.

## 🤝 Contributing

1. Fork & clone.
2. `pnpm install && npx convex dev`.
3. Commit: Conventional (e.g., "feat: add goal sharing").
4. PR: Describe changes, test screenshots.

Hackathon code—PRs welcome for polish!

## 📄 License

MIT ©pena56 2025. Built with ❤️.

---

**Questions?** Open an issue or ping [@pena_mo56 on X](https://x.com/pena_mo56). Let's level up finances together! 🚀
