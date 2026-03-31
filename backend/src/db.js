// модуль для підключення до SQLite

const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

console.log("DB.JS ЗАПУСТИВСЯ");

// шлях до папки data
const dataDir = path.join(__dirname, "..", "data");

// шлях до файлу бази даних
const dbPath = path.join(dataDir, "app.db");

// якщо папки data немає — створюємо її
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// відкриваємо або створюємо файл бази
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Помилка підключення до SQLite:", err.message);
        process.exit(1);
    }

    console.log("SQLite підключено:", dbPath);
});

module.exports = { db };