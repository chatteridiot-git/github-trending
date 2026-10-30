const axios = require('axios');

const BASE = 'https://api.github.com';

function headers() {
    const h = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
    };
    if (process.env.GITHUB_TOKEN) {
        h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    return h;
}

async function searchRecentRepos(days = 30, perPage = 100) {
    const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    const url = `${BASE}/search/repositories?q=created:>${since}&sort=stars&order=desc&per_page=${perPage}`;
    const res = await axios.get(url, { headers: headers(), timeout: 30000 });
    return (res.data.items || []).map((r) => ({ ...r, topics: r.topics || [] }));
}

async function getRepo(fullName) {
    const res = await axios.get(`${BASE}/repos/${fullName}`, { headers: headers(), timeout: 30000 });
    return res.data;
}

module.exports = { searchRecentRepos, getRepo };
