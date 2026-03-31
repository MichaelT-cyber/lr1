// скрипт для заповнення бази тестовими даними

const { initDb } = require("./initDb");
const { run } = require("./dbClient");

async function seed() {
    try {
        await initDb();

        console.log("Починаємо seed...");

        // очищаємо таблиці перед наповненням
        await run(`DELETE FROM Passes;`);
        await run(`DELETE FROM Reasons;`);
        await run(`DELETE FROM Users;`);

        // додаємо користувачів
        await run(`
            INSERT INTO Users (fullName, role, isActive)
            VALUES ('Михайло', 'Студент', 1);
        `);

        await run(`
            INSERT INTO Users (fullName, role, isActive)
            VALUES ('Олена', 'Викладач', 1);
        `);

        await run(`
            INSERT INTO Users (fullName, role, isActive)
            VALUES ('Андрій', 'Студент', 0);
        `);

        // додаємо причини
        await run(`
            INSERT INTO Reasons (title, description)
            VALUES ('Навчання', 'Доступ до комп’ютерного класу для занять');
        `);

        await run(`
            INSERT INTO Reasons (title, description)
            VALUES ('Практична робота', 'Виконання лабораторної роботи');
        `);

        // додаємо пропуски
        await run(`
            INSERT INTO Passes (userId, reasonId, date, status)
            VALUES (1, 1, '2026-03-30', 'active');
        `);

        await run(`
            INSERT INTO Passes (userId, reasonId, date, status)
            VALUES (2, 2, '2026-03-31', 'active');
        `);

        console.log("Seed успішно виконано");
    } catch (error) {
        console.error("Помилка seed:", error);
    }
}

seed();