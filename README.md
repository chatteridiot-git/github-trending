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

## Prerequisites

- **Node.js** >= 18 (includes npm)
- **SQLite** — bundled via Node's built-in `node:sqlite` module (no separate install needed)
- **Git** (optional, for cloning)
- A GitHub **Personal Access Token** (optional but recommended) for higher API rate limits

## Manual Installation (Web Hosting / Production)

1. **Clone the repository**
   ```bash
   git clone <repo-url> github-trending
   cd github-trending
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install --production
   cp .env.example .env
   # Edit .env: set PORT and optionally GITHUB_TOKEN
   npm run initdb
   ```

3. **Install frontend dependencies and build**
   ```bash
   cd ../frontend
   npm install
   npm run build
   # Output is in frontend/dist/
   ```

4. **Run the backend in production**
   ```bash
   cd ../backend
   NODE_ENV=production PORT=3001 node src/server.js
   ```
   Use a process manager (pm2, systemd) to keep it running:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name github-trending-api
   ```

5. **Serve the frontend**
   - Static host (Nginx, Apache, Vercel, Netlify): point document root to `frontend/dist/`.
   - Configure a reverse proxy so `/api/*` requests reach the backend (port 3001).
   - Example Nginx:
     ```nginx
     server {
       listen 80;
       root /var/www/github-trending/frontend/dist;
       location / { try_files $uri $uri/ /index.html; }
       location /api/ { proxy_pass http://127.0.0.1:3001; }
     }
     ```

6. **Seed data**
   ```bash
   cd backend
   npm run worker   # or use the "Fetch Repos" button in the UI
   ```
   Schedule `npm run worker` via cron to keep snapshots fresh.

## Setup (Local Development)

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