// модуль для створення таблиць при старті сервера

const { run } = require("./dbClient");

console.log("INIT DB ЗАПУСТИВСЯ");

async function initDb() {
    // увімкнути зовнішні ключі
    await run("PRAGMA foreign_keys = ON;");

    // таблиця користувачів
    await run(`
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY,
            fullName TEXT NOT NULL,
            role TEXT NOT NULL,
            isActive INTEGER NOT NULL DEFAULT 1
        );
    `);

    // таблиця причин
    await run(`
        CREATE TABLE IF NOT EXISTS Reasons (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL UNIQUE,
            description TEXT
        );
    `);

    // таблиця пропусків
    await run(`
        CREATE TABLE IF NOT EXISTS Passes (
            id INTEGER PRIMARY KEY,
            userId INTEGER NOT NULL,
            reasonId INTEGER,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
            FOREIGN KEY (reasonId) REFERENCES Reasons(id) ON DELETE SET NULL
        );
    `);

    console.log("Схему БД ініціалізовано");
}

module.exports = { initDb };