# GitHub Trending — Momentum Tracker

Ranks GitHub repositories by **star velocity** (stars gained over a time window) instead of total star count, so you can see what's actually gaining momentum right now.

## Architecture

- `backend/` — Node.js + Fastify + SQLite. Crawls GitHub Search for recent repos, stores timestamped star snapshots, classifies repos into categories, and serves `/api/trending`.
- `frontend/` — Vite + React + Tailwind CSS leaderboard UI (renaissance themed).

## Features

- Duration filters: **24H**, **7D**, **1M**.
- Categories: **AI**, **Security**, **Trading**, **DevTools**, **Education**, **Others** (keyword-based).
- Pagination over the top 100 repos per filter.
- **Fetch Repos** button to trigger the crawler from the browser.
- Momentum delta = stars gained in the selected window.

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # optional: set GITHUB_TOKEN for higher rate limits
npm run initdb
npm run worker         # crawl + snapshot repos
npm run server         # http://localhost:3001
```

Run `npm run worker` periodically (cron) or use the **Fetch Repos** button to accumulate snapshots so momentum deltas populate.

### Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173 (proxies /api to backend)
npm run build          # production build
```

## API

- `GET /api/health`
- `GET /api/categories` — list of categories
- `GET /api/trending?window=24h&category=All&limit=100&page=1&pageSize=20`
- `POST /api/fetch` — run the worker (crawl + snapshot)
EOF
echo done