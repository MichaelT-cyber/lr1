// модуль для застосування SQL-міграцій

const fs = require("fs");
const path = require("path");
const { run, all } = require("./dbClient");

async function migrate() {
    // увімкнути зовнішні ключі
    await run("PRAGMA foreign_keys = ON;");

    // таблиця для обліку застосованих міграцій
    await run(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id INTEGER PRIMARY KEY,
            filename TEXT NOT NULL UNIQUE,
            appliedAt TEXT NOT NULL
        );
    `);

    const migrationsDir = path.join(__dirname, "migrations");

    const files = fs
        .readdirSync(migrationsDir)
        .filter((file) => /^\d+_.+\.sql$/.test(file))
        .sort();

    const applied = await all(`
        SELECT filename
        FROM schema_migrations;
    `);

    const appliedSet = new Set(applied.map((row) => row.filename));

    for (const file of files) {
        if (appliedSet.has(file)) {
            continue;
        }

        const fullPath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(fullPath, "utf8").trim();

        if (!sql) {
            continue;
        }

        await run(sql);

        const now = new Date().toISOString();
        const safeFilename = file.replace(/'/g, "''");

        await run(`
            INSERT INTO schema_migrations (filename, appliedAt)
            VALUES ('${safeFilename}', '${now}');
        `);

        console.log(`Міграцію застосовано: ${file}`);
    }

    console.log("Усі міграції перевірено");
}

module.exports = { migrate };