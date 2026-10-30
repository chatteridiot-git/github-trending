CREATE TABLE IF NOT EXISTS repositories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    description TEXT,
    html_url TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    category TEXT NOT NULL DEFAULT 'Others'
);

CREATE INDEX IF NOT EXISTS idx_repos_category ON repositories(category);

CREATE TABLE IF NOT EXISTS star_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repo_id TEXT NOT NULL,
    star_count INTEGER NOT NULL,
    captured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (repo_id) REFERENCES repositories(id)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_repo_time ON star_snapshots(repo_id, captured_at);
