import { useEffect, useState } from 'react';

const WINDOWS = [
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 },
];

function momentumColor(delta) {
  if (delta > 0) return 'text-emerald-400';
  if (delta < 0) return 'text-rose-400';
  return 'text-slate-400';
}

function RepoRow({ repo, rank, windowHours }) {
  const delta = repo.starsWindow;
  return (
    <div className="grid grid-cols-12 gap-3 items-center px-4 py-3 border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">
      <div className="col-span-1 text-slate-500 font-mono text-sm">{rank}</div>
      <div className="col-span-5 min-w-0">
        <a href={repo.url} target="_blank" rel="noreferrer" className="text-slate-100 font-semibold hover:text-sky-400 truncate block">
          {repo.fullName}
        </a>
        <p className="text-slate-400 text-sm truncate">{repo.description || 'No description'}</p>
      </div>
      <div className="col-span-2 text-right font-mono text-slate-200">{repo.stars.toLocaleString()}</div>
      <div className={`col-span-2 text-right font-mono ${momentumColor(delta)}`}>
        {delta >= 0 ? '+' : ''}{delta.toLocaleString()}
        <span className="text-xs text-slate-500 ml-1">/{windowHours}h</span>
      </div>
      <div className="col-span-2 text-right text-xs text-slate-500">
        {repo.hasBaseline ? 'tracked' : 'new'}
      </div>
    </div>
  );
}

export default function App() {
  const [windowHours, setWindowHours] = useState(24);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/trending?window=${windowHours}&limit=50`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setRepos(data.repos || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [windowHours]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">GitHub Momentum</h1>
            <p className="text-slate-400 text-sm">Repositories gaining stars fastest right now.</p>
          </div>
          <div className="flex gap-2">
            {WINDOWS.map((w) => (
              <button
                key={w.hours}
                onClick={() => setWindowHours(w.hours)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                  windowHours === w.hours
                    ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                    : 'border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Repository</div>
          <div className="col-span-2 text-right">Stars</div>
          <div className="col-span-2 text-right">Momentum</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {loading && <div className="py-12 text-center text-slate-500">Loading…</div>}
        {error && <div className="py-12 text-center text-rose-400">{error}</div>}
        {!loading && !error && repos.length === 0 && (
          <div className="py-12 text-center text-slate-500">No data yet. Run the worker.</div>
        )}
        {!loading && !error && repos.map((repo, i) => (
          <RepoRow key={repo.id} repo={repo} rank={i + 1} windowHours={windowHours} />
        ))}
      </main>
    </div>
  );
}
