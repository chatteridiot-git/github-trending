require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { initDb, upsertRepo, insertSnapshot } = require('./db');
const gh = require('./github');
const { classify } = require('./classify');

async function run() {
    await initDb();
    console.log('Discovering candidate repositories...');
    const items = await gh.searchRecentRepos(30, 100);
    console.log(`Found ${items.length} candidates`);

    let saved = 0;
    for (const r of items) {
        const repo = {
            id: String(r.id),
            name: r.name,
            full_name: r.full_name,
            description: r.description,
            html_url: r.html_url,
            created_at: r.created_at,
            category: classify(r),
        };
        await upsertRepo(repo);
        await insertSnapshot(repo.id, r.stargazers_count);
        saved++;
    }
    console.log(`Saved ${saved} repositories with star snapshots.`);
}

run().catch((err) => {
    console.error('Worker failed:', err && err.message ? err.message : err);
    process.exit(1);
});
