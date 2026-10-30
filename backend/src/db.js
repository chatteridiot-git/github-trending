const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'trending.db');
const SCHEMA_PATH = path.join(__dirname, 'db', 'schema.sql');

const db = new sqlite3.Database(DB_PATH);

function initDb() {
    return new Promise((resolve, reject) => {
        const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
        db.exec(schema, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

module.exports = {
    db,
    initDb
};
