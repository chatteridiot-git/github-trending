require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const path = require('path');
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const { initDb, query, get } = require('./db');

const app = Fastify({ logger: true });

async function computeTrending(windowHours = 24, limit = 50) {
    const repos = await query('SELECT * FROM repositories');
    const cutoff = new Date(Date.now() - windowHours * 3600000).toISOString();

    const results = [];
    for (const repo of repos) {
        const latest = await get(
            `SELECT star_count, captured_at FROM star_snapshots WHERE repo_id = ? ORDER BY captured_at DESC LIMIT 1`,
            [repo.id]
        );
        if (!latest) continue;

        const baseline = await get(
            `SELECT star_count, captured_at FROM star_snapshots
             WHERE repo_id = ? AND captured_at <= ? ORDER BY captured_at DESC LIMIT 1`,
            [repo.id, cutoff]
        );

        const baselineCount = baseline ? baseline.star_count : null;
        const delta = baselineCount != null ? latest.star_count - baselineCount : 0;

        results.push({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            url: repo.html_url,
            createdAt: repo.created_at,
            stars: latest.star_count,
            stars24h: windowHours === 24 ? delta : null,
            starsWindow: delta,
            windowHours,
            hasBaseline: baselineCount != null,
        });
    }

    results.sort((a, b) => {
        if (b.starsWindow !== a.starsWindow) return b.starsWindow - a.starsWindow;
        return b.stars - a.stars;
    });
    return results.slice(0, limit);
}

async function main() {
    await initDb();
    await app.register(cors, { origin: true });

    app.get('/api/health', async () => ({ ok: true }));

    app.get('/api/trending', async (req) => {
        const windowHours = Number(req.query.window) || 24;
        const limit = Number(req.query.limit) || 50;
        const data = await computeTrending(windowHours, limit);
        return { windowHours, count: data.length, repos: data };
    });

    const port = Number(process.env.PORT) || 3001;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Backend listening on http://localhost:${port}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
