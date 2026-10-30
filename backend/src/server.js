require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const path = require('path');
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const { initDb, query, get } = require('./db');
const { spawn } = require('child_process');

const WINDOWS = { '24h': 24, '7d': 168, '30d': 720 };
const VALID_CATEGORIES = ['AI', 'Security', 'Trading', 'DevTools', 'Education', 'Others'];

const app = Fastify({ logger: true });

async function computeTrending(windowHours, limit, category) {
    const cutoff = new Date(Date.now() - windowHours * 3600000).toISOString();

    let sql = 'SELECT * FROM repositories';
    const params = [];
    if (category && category !== 'All') {
        sql += ' WHERE category = ?';
        params.push(category);
    }
    const repos = await query(sql, params);

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
            category: repo.category,
            stars: latest.star_count,
            momentum: delta,
            hasBaseline: baselineCount != null,
        });
    }

    results.sort((a, b) => {
        if (b.momentum !== a.momentum) return b.momentum - a.momentum;
        return b.stars - a.stars;
    });
    return results.slice(0, limit);
}

async function main() {
    await initDb();
    await app.register(cors, { origin: true });

    app.get('/api/health', async () => ({ ok: true }));

    app.get('/api/categories', async () => ({ categories: VALID_CATEGORIES }));

    app.post('/api/fetch', async (req, reply) => {
        return new Promise((resolve) => {
            const workerPath = path.join(__dirname, 'worker.js');
            const child = spawn(process.execPath, [workerPath], {
                cwd: path.join(__dirname, '..'),
                env: process.env,
                stdio: ['ignore', 'pipe', 'pipe'],
            });
            let out = '';
            let err = '';
            child.stdout.on('data', (d) => { out += d.toString(); });
            child.stderr.on('data', (d) => { err += d.toString(); });
            child.on('close', (code) => {
                if (code === 0) resolve({ ok: true, output: out.trim() });
                else reply.code(500).send({ ok: false, error: err.trim() || `exit ${code}` });
            });
        });
    });

    app.get('/api/trending', async (req) => {
        const windowKey = (req.query.window || '24h').toLowerCase();
        const windowHours = WINDOWS[windowKey] || 24;
        const limit = Math.min(Number(req.query.limit) || 100, 100);
        const category = req.query.category || 'All';
        const page = Math.max(Number(req.query.page) || 1, 1);
        const pageSize = Math.min(Number(req.query.pageSize) || 20, 100);

        const all = await computeTrending(windowHours, limit, category);
        const total = all.length;
        const start = (page - 1) * pageSize;
        const repos = all.slice(start, start + pageSize);

        return {
            window: windowKey,
            windowHours,
            category,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            repos,
        };
    });

    const port = Number(process.env.PORT) || 3001;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Backend listening on http://localhost:${port}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
