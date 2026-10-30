const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, '..', 'trending.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'db', 'schema.sql');

const db = new DatabaseSync(DB_PATH);

function initDb() {
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema);
    return Promise.resolve();
}

function query(sql, params = []) {
    try {
        const stmt = db.prepare(sql);
        const rows = stmt.all(...params);
        return Promise.resolve(rows);
    } catch (err) {
        return Promise.reject(err);
    }
}

function get(sql, params = []) {
    try {
        const stmt = db.prepare(sql);
        const row = stmt.get(...params);
        return Promise.resolve(row);
    } catch (err) {
        return Promise.reject(err);
    }
}

function run(sql, params = []) {
    try {
        const stmt = db.prepare(sql);
        const info = stmt.run(...params);
        return Promise.resolve({ lastID: Number(info.lastInsertRowid), changes: info.changes });
    } catch (err) {
        return Promise.reject(err);
    }
}

async function upsertRepo(repo) {
    await run(
        `INSERT INTO repositories (id, name, full_name, description, html_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name=excluded.name, full_name=excluded.full_name, description=excluded.description,
           html_url=excluded.html_url, created_at=excluded.created_at`,
        [repo.id, repo.name, repo.full_name, repo.description, repo.html_url, repo.created_at]
    );
}

async function insertSnapshot(repoId, starCount) {
    await run(
        `INSERT INTO star_snapshots (repo_id, star_count, captured_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
        [repoId, starCount]
    );
}

module.exports = { db, initDb, query, get, run, upsertRepo, insertSnapshot };
