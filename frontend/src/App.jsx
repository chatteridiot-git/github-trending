import { useEffect, useState } from 'react';

const WINDOWS = [
  { label: '24h', key: '24h' },
  { label: '7d', key: '7d' },
  { label: '1m', key: '30d' },
];

const CATEGORIES = ['All', 'AI', 'Security', 'Trading', 'DevTools', 'Web', 'Data', 'Mobile', 'Gaming', 'Education', 'Others'];

const OCEAN = {
  bg: 'bg-gradient-to-b from-slate-950 via-cyan-950/40 to-slate-950',
};

function momentumColor(delta) {
  if (delta > 0) return 'text-emerald-300';
  if (delta < 0) return 'text-rose-300';
  return 'text-slate-400';
}

function categoryBadge(cat) {
  const map = {
    AI: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    Security: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    Trading: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    DevTools: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    Web: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    Data: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    Mobile: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    Gaming: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    Education: 'bg-lime-500/20 text-lime-300 border-lime-500/40',
    Others: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  };
  return map[cat] || map.Others;
}

function RepoRow({ repo, rank }) {
  const delta = repo.momentum;
  return (
    <div className="grid grid-cols-12 gap-3 items-center px-4 py-3 border-b border-cyan-900/30 hover:bg-cyan-900/20 transition-colors">
      <div className="col-span-1 text-cyan-700 font-mono text-sm">{rank}</div>
      <div className="col-span-4 min-w-0">
        <a href={repo.url} target="_blank" rel="noreferrer" className="text-cyan-100 font-semibold hover:text-cyan-300 truncate block">
          {repo.fullName}
        </a>
        <p className="text-slate-400 text-sm truncate">{repo.description || 'No description'}</p>
      </div>
      <div className="col-span-2">
        <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryBadge(repo.category)}`}>
          {repo.category}
        </span>
      </div>
      <div className="col-span-2 text-right font-mono text-cyan-200">{repo.stars.toLocaleString()}</div>
      <div className={`col-span-2 text-right font-mono ${momentumColor(delta)}`}>
        {delta >= 0 ? '+' : ''}{delta.toLocaleString()}
      </div>
      <div className="col-span-1 text-right text-xs text-slate-500">
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

  useEffect(() => {
    setPage(1);
  }, [windowKey, category]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/trending?window=${windowKey}&category=${encodeURIComponent(category)}&limit=100&page=${page}&pageSize=20`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [windowKey, category, page]);

  return (
    <div className={`min-h-screen ${OCEAN.bg} text-slate-100`}>
      {/* ocean waves background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-30">
        <div className="absolute -bottom-20 -left-20 w-[140%] h-64 bg-gradient-to-t from-cyan-500/30 to-transparent blur-2xl animate-pulse" />
        <div className="absolute top-10 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <header className="relative border-b border-cyan-900/40 px-6 py-5 backdrop-blur">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-cyan-100 drop-shadow">GitHub Momentum</h1>
            <p className="text-cyan-300/70 text-sm">Repositories gaining stars fastest right now.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {WINDOWS.map((w) => (
              <button
                key={w.key}
                onClick={() => setWindowKey(w.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                  windowKey === w.key
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.35)]'
                    : 'border-cyan-900/60 text-cyan-400/70 hover:text-cyan-200'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                category === c
                  ? 'bg-cyan-400/20 border-cyan-300 text-cyan-100'
                  : 'border-cyan-900/50 text-cyan-400/60 hover:text-cyan-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs uppercase tracking-wider text-cyan-600/70 border-b border-cyan-900/40">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Repository</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2 text-right">Stars</div>
          <div className="col-span-2 text-right">Momentum</div>
          <div className="col-span-1 text-right">Status</div>
        </div>

        {loading && <div className="py-12 text-center text-cyan-400/60">Loading…</div>}
        {error && <div className="py-12 text-center text-rose-400">{error}</div>}
        {!loading && !error && data.repos.length === 0 && (
          <div className="py-12 text-center text-cyan-400/60">No data yet. Run the worker.</div>
        )}
        {!loading && !error && data.repos.map((repo, i) => (
          <RepoRow key={repo.id} repo={repo} rank={(page - 1) * 20 + i + 1} />
        ))}

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 text-sm">
            <span className="text-cyan-400/60">
              Page {data.page} of {data.totalPages} · {data.total} repos
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-md border border-cyan-900/60 text-cyan-300 disabled:opacity-40 hover:bg-cyan-900/30"
              >
                Prev
              </button>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                className="px-3 py-1.5 rounded-md border border-cyan-900/60 text-cyan-300 disabled:opacity-40 hover:bg-cyan-900/30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
