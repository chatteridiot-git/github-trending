import { useEffect, useState } from 'react';

const WINDOWS = [
  { label: '24H', key: '24h' },
  { label: '7D', key: '7d' },
  { label: '1M', key: '30d' },
];

const CATEGORIES = ['All', 'AI', 'Security', 'Trading', 'DevTools', 'Education', 'Others'];

function categoryBadge(cat) {
  const map = {
    AI: 'bg-purple-900/60 text-amber-200 border-amber-700/60',
    Security: 'bg-red-900/60 text-red-200 border-red-700/60',
    Trading: 'bg-yellow-900/60 text-yellow-200 border-yellow-700/60',
    DevTools: 'bg-blue-900/60 text-blue-200 border-blue-700/60',
    Education: 'bg-green-900/60 text-green-200 border-green-700/60',
    Others: 'bg-stone-800/60 text-stone-300 border-stone-600/60',
  };
  return map[cat] || map.Others;
}

function momentumColor(delta) {
  if (delta > 0) return 'text-emerald-300';
  if (delta < 0) return 'text-rose-300';
  return 'text-stone-400';
}

function RepoRow({ repo, rank }) {
  const delta = repo.momentum;
  return (
    <div className="grid grid-cols-12 gap-3 items-center px-4 py-3 border-b border-amber-900/30 hover:bg-amber-900/10 transition-colors">
      <div className="col-span-1 text-amber-700/70 font-serif text-sm">{rank}</div>
      <div className="col-span-4 min-w-0">
        <a href={repo.url} target="_blank" rel="noreferrer" className="text-amber-100 font-serif font-semibold hover:text-amber-300 truncate block">
          {repo.fullName}
        </a>
        <p className="text-stone-400 text-sm truncate italic">{repo.description || 'No description'}</p>
      </div>
      <div className="col-span-2">
        <span className={`text-xs px-2 py-0.5 rounded border ${categoryBadge(repo.category)}`}>
          {repo.category}
        </span>
      </div>
      <div className="col-span-2 text-right font-mono text-amber-200">{repo.stars.toLocaleString()}</div>
      <div className={`col-span-2 text-right font-mono ${momentumColor(delta)}`}>
        {delta >= 0 ? '+' : ''}{delta.toLocaleString()}
      </div>
      <div className="col-span-1 text-right text-xs text-stone-500">
        {repo.hasBaseline ? 'tracked' : 'new'}
      </div>
    </div>
  );
}

export default function App() {
  const [windowKey, setWindowKey] = useState('24h');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ repos: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState('');

  useEffect(() => { setPage(1); }, [windowKey, category]);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch(`/api/trending?window=${windowKey}&category=${encodeURIComponent(category)}&limit=100&page=${page}&pageSize=20`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [windowKey, category, page]);

  const fetchRepos = async () => {
    setFetching(true);
    setFetchMsg('Summoning repositories…');
    try {
      const r = await fetch('/api/fetch', { method: 'POST' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed');
      setFetchMsg('Done. Refreshing…');
      load();
    } catch (e) {
      setFetchMsg(`Error: ${e.message}`);
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1410] text-amber-100 relative overflow-hidden">
      {/* parchment + candlelight */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(217,119,6,0.15),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(120,53,15,0.4),_transparent_70%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-700/60 to-transparent" />
      </div>

      <header className="relative border-b border-amber-900/50 px-6 py-6 backdrop-blur bg-[#1a1410]/80">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-wide text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              ⚜ GitHub Momentum ⚜
            </h1>
            <p className="text-amber-400/70 text-sm italic font-serif">Repositories gaining stars fastest, in the age of discovery.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={fetchRepos}
              disabled={fetching}
              className="px-4 py-1.5 rounded border border-amber-700/60 bg-amber-900/40 text-amber-200 text-sm font-serif hover:bg-amber-800/60 disabled:opacity-50 transition-colors shadow-[0_0_8px_rgba(217,119,6,0.2)]"
            >
              {fetching ? 'Fetching…' : 'Fetch Repos'}
            </button>
            {WINDOWS.map((w) => (
              <button
                key={w.key}
                onClick={() => setWindowKey(w.key)}
                className={`px-3 py-1.5 rounded border text-sm font-serif transition-colors ${
                  windowKey === w.key
                    ? 'bg-amber-700/40 border-amber-400 text-amber-100 shadow-[0_0_12px_rgba(217,119,6,0.4)]'
                    : 'border-amber-900/60 text-amber-400/70 hover:text-amber-200'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
        {fetchMsg && (
          <div className="max-w-6xl mx-auto mt-2 text-xs italic text-amber-400/80">{fetchMsg}</div>
        )}
        <div className="max-w-6xl mx-auto mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded border text-xs font-serif transition-colors ${
                category === c
                  ? 'bg-amber-600/30 border-amber-400 text-amber-100'
                  : 'border-amber-900/50 text-amber-400/60 hover:text-amber-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs uppercase tracking-widest text-amber-700/70 border-b border-amber-900/40 font-serif">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Repository</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2 text-right">Stars</div>
          <div className="col-span-2 text-right">Momentum</div>
          <div className="col-span-1 text-right">Status</div>
        </div>

        {loading && <div className="py-12 text-center text-amber-400/60 font-serif italic">Loading…</div>}
        {error && <div className="py-12 text-center text-rose-400">{error}</div>}
        {!loading && !error && data.repos.length === 0 && (
          <div className="py-12 text-center text-amber-400/60 font-serif italic">No data yet. Fetch repositories.</div>
        )}
        {!loading && !error && data.repos.map((repo, i) => (
          <RepoRow key={repo.id} repo={repo} rank={(page - 1) * 20 + i + 1} />
        ))}

        {data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 text-sm font-serif">
            <span className="text-amber-400/60">
              Page {data.page} of {data.totalPages} · {data.total} repos
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded border border-amber-900/60 text-amber-300 disabled:opacity-40 hover:bg-amber-900/30"
              >
                Prev
              </button>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                className="px-3 py-1.5 rounded border border-amber-900/60 text-amber-300 disabled:opacity-40 hover:bg-amber-900/30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="relative border-t border-amber-900/40 px-6 py-4 text-center text-xs text-amber-700/60 font-serif italic">
        ⚜ In the spirit of the Renaissance ⚜
      </footer>
    </div>
  );
}
