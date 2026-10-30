# GitHub Trending — Momentum Tracker

Ranks GitHub repositories by **star velocity** (stars gained over a time window) instead of total star count, so you can see what's actually gaining momentum right now.

## Architecture

- `backend/` — Node.js + Fastify + SQLite. Crawls GitHub Search for recent repos, stores timestamped star snapshots, and serves `/api/trending`.
- `frontend/` — Vite + React + Tailwind CSS leaderboard UI.

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # optionally set GITHUB_TOKEN for higher rate limits
npm run initdb
npm run worker         # crawl + snapshot
npm run server         # http://localhost:3001
```

Run `npm run worker` periodically (cron) to accumulate snapshots for momentum deltas.

### Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173 (proxies /api to backend)
```

## API

- `GET /api/health`
- `GET /api/trending?window=24&limit=50` — `window` in hours (24 or 168).
