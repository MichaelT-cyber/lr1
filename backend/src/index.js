const { migrate } = require("./migrate");
const { all, get, run } = require("./dbClient");

// підключаємо express
const express = require("express");
const cors = require("cors");

// створюємо сервер
const app = express();

// стандартна успішна відповідь API
function success(res, data, status = 200) {
    return res.status(status).json({
        success: true,
        data
    });
}

// стандартна відповідь API з помилкою
function fail(res, message, status = 500) {
    return res.status(status).json({
        success: false,
        message
    });
}

// дозволяємо запити з браузера
app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://127.0.0.1:5501",
        "http://localhost:5500",
        "http://localhost:5501"
    ]
}));

// порт сервера
const PORT = 3000;

// дозволяємо читати JSON
app.use(express.json());

/*
  Тестовий маршрут
*/
app.get("/", (req, res) => {
    return success(res, { message: "Server працює" });
});


// ======================================================
// USERS
// ======================================================

// отримати список користувачів
app.get("/api/users", async (req, res) => {
    try {
        const users = await all(`
            SELECT id, fullName, role, isActive
            FROM Users
            ORDER BY id DESC;
        `);

        return success(res, users);
    } catch (err) {
        return fail(res, "Помилка при отриманні користувачів", 500);
    }
});

// пошук користувачів (WHERE + ORDER BY + LIMIT)
app.get("/api/users/search", async (req, res) => {
    try {
        const { role, limit = 5 } = req.query;

        let sql = `
            SELECT id, fullName, role, isActive
            FROM Users
        `;

        // якщо передана роль — додаємо WHERE
        if (role) {
            const safeRole = String(role).replace(/'/g, "''");
            sql += ` WHERE role = '${safeRole}'`;
        }

        // додаємо сортування та обмеження
        sql += ` ORDER BY id DESC LIMIT ${Number(limit)};`;

        const users = await all(sql);

        return success(res, users);
    } catch (err) {
        return fail(res, "Помилка при пошуку користувачів", 500);
    }
});

// отримати користувача за id
app.get("/api/users/:id", async (req, res) => {
    try {
        const userId = Number(req.params.id);

        // перевірка коректності id
        if (!Number.isFinite(userId)) {
            return fail(res, "Некоректний id користувача", 400);
        }

        const user = await get(`
            SELECT id, fullName, role, isActive
            FROM Users
            WHERE id = ${userId};
        `);

        // якщо користувача не знайдено
        if (!user) {
            return fail(res, "Користувача не знайдено", 404);
        }

        return success(res, user);
    } catch (err) {
        return fail(res, "Помилка при отриманні користувача", 500);
    }
});

// створити користувача
app.post("/api/users", async (req, res) => {
    try {
        const { fullName, role, isActive } = req.body;

        // валідація поля fullName
        if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
            return fail(res, "Поле fullName обов'язкове і має містити мінімум 2 символи", 400);
        }

        // валідація поля role
        if (!role || typeof role !== "string" || role.trim().length < 2) {
            return fail(res, "Поле role обов'язкове і має містити мінімум 2 символи", 400);
        }

        // захист від апострофів у SQL
        const safeFullName = fullName.trim().replace(/'/g, "''");
        const safeRole = role.trim().replace(/'/g, "''");

        // булеве значення переводимо у 1 або 0
        const safeIsActive = typeof isActive === "boolean" ? (isActive ? 1 : 0) : 1;

        // створення користувача
        const result = await run(`
            INSERT INTO Users (fullName, role, isActive)
            VALUES ('${safeFullName}', '${safeRole}', ${safeIsActive});
        `);

        // отримуємо створений запис назад
        const createdUser = await get(`
            SELECT id, fullName, role, isActive
            FROM Users
            WHERE id = ${result.lastID};
        `);

        return success(res, createdUser, 201);
    } catch (err) {
        return fail(res, "Помилка при створенні користувача", 500);
    }
});

// оновити користувача
app.put("/api/users/:id", async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const { fullName, role, isActive } = req.body;

        // перевірка id
        if (!Number.isFinite(userId)) {
            return fail(res, "Некоректний id", 400);
        }

        // перевірка обов'язкових полів
        if (!fullName || !role) {
            return fail(res, "fullName і role обов'язкові", 400);
        }

        // підготовка текстових полів
        const safeFullName = fullName.replace(/'/g, "''");
        const safeRole = role.replace(/'/g, "''");

        // булеве значення переводимо у 1 або 0
        const safeIsActive = typeof isActive === "boolean" ? (isActive ? 1 : 0) : 1;

        // оновлення запису
        const result = await run(`
            UPDATE Users
            SET fullName = '${safeFullName}',
                role = '${safeRole}',
                isActive = ${safeIsActive}
            WHERE id = ${userId};
        `);

        // якщо жоден запис не змінено — такого користувача нема
        if (result.changes === 0) {
            return fail(res, "Користувача не знайдено", 404);
        }

        // дістаємо оновлений запис
        const updatedUser = await get(`
            SELECT id, fullName, role, isActive
            FROM Users
            WHERE id = ${userId};
        `);

        return success(res, updatedUser);
    } catch (err) {
        return fail(res, "Помилка при оновленні користувача", 500);
    }
});

// видалити користувача
app.delete("/api/users/:id", async (req, res) => {
    try {
        const userId = Number(req.params.id);

        // перевірка id
        if (!Number.isFinite(userId)) {
            return fail(res, "Некоректний id", 400);
        }

        // видалення користувача
        const result = await run(`
            DELETE FROM Users
            WHERE id = ${userId};
        `);

        // якщо користувача не знайдено
        if (result.changes === 0) {
            return fail(res, "Користувача не знайдено", 404);
        }

        return success(res, { deleted: true });
    } catch (err) {
        return fail(res, "Помилка при видаленні користувача", 500);
    }
});


// ======================================================
// PASSES
// ======================================================

// отримати список пропусків
app.get("/api/passes", async (req, res) => {
    try {
        const passes = await all(`
            SELECT id, userId, reasonId, date, status
            FROM Passes
            ORDER BY id DESC;
        `);

        return success(res, passes);
    } catch (err) {
        return fail(res, "Помилка при отриманні пропусків", 500);
    }
});

// отримати список пропусків разом з даними користувача і причини
app.get("/api/passes/full", async (req, res) => {
    try {
        const passes = await all(`
            SELECT
                p.id,
                p.userId,
                p.reasonId,
                p.date,
                p.status,
                u.fullName,
                u.role,
                r.title AS reasonTitle
            FROM Passes p
            JOIN Users u ON p.userId = u.id
            LEFT JOIN Reasons r ON p.reasonId = r.id
            ORDER BY p.id DESC;
        `);

        return success(res, passes);
    } catch (err) {
        return fail(res, "Помилка при отриманні повних даних про пропуски", 500);
    }
});

// статистика пропусків
app.get("/api/passes/stats", async (req, res) => {
    try {
        // загальна кількість пропусків
        const total = await get(`
            SELECT COUNT(*) as count FROM Passes;
        `);

        // кількість активних
        const active = await get(`
            SELECT COUNT(*) as count FROM Passes WHERE status = 'active';
        `);

        // кількість оновлених
        const updated = await get(`
            SELECT COUNT(*) as count FROM Passes WHERE status = 'updated';
        `);

        return success(res, {
            total: total.count,
            active: active.count,
            updated: updated.count
        });
    } catch (err) {
        return fail(res, "Помилка при отриманні статистики", 500);
    }
});

// отримати пропуск за id
app.get("/api/passes/:id", async (req, res) => {
    try {
        const passId = Number(req.params.id);

        // перевірка id
        if (!Number.isFinite(passId)) {
            return fail(res, "Некоректний id пропуску", 400);
        }

        const pass = await get(`
            SELECT id, userId, reasonId, date, status
            FROM Passes
            WHERE id = ${passId};
        `);

        // якщо запис не знайдено
        if (!pass) {
            return fail(res, "Пропуск не знайдено", 404);
        }

        return success(res, pass);
    } catch (err) {
        return fail(res, "Помилка при отриманні пропуску", 500);
    }
});

// створити пропуск
app.post("/api/passes", async (req, res) => {
    try {
        const { userId, reasonId, date, status } = req.body;

        // перевірка userId
        if (!userId || Number.isNaN(Number(userId))) {
            return fail(res, "Поле userId обов'язкове", 400);
        }

        // перевірка date
        if (!date || typeof date !== "string" || date.trim().length < 2) {
            return fail(res, "Поле date обов'язкове", 400);
        }

        // перевірка status
        if (!status || typeof status !== "string" || status.trim().length < 2) {
            return fail(res, "Поле status обов'язкове", 400);
        }

        const numericUserId = Number(userId);

        // перевірка, чи існує користувач
        const existingUser = await get(`
            SELECT id
            FROM Users
            WHERE id = ${numericUserId};
        `);

        if (!existingUser) {
            return fail(res, "Користувача з таким userId не існує", 400);
        }

        const safeDate = date.trim().replace(/'/g, "''");
        const safeStatus = status.trim().replace(/'/g, "''");

        // reasonId може бути NULL
        let safeReasonId = "NULL";
        if (reasonId !== undefined && reasonId !== null && reasonId !== "") {
            if (Number.isNaN(Number(reasonId))) {
                return fail(res, "Поле reasonId має бути числом", 400);
            }
            safeReasonId = Number(reasonId);
        }

        // створення пропуску
        const result = await run(`
            INSERT INTO Passes (userId, reasonId, date, status)
            VALUES (${numericUserId}, ${safeReasonId}, '${safeDate}', '${safeStatus}');
        `);

        // отримуємо створений запис
        const createdPass = await get(`
            SELECT id, userId, reasonId, date, status
            FROM Passes
            WHERE id = ${result.lastID};
        `);

        return success(res, createdPass, 201);
    } catch (err) {
        return fail(res, "Помилка при створенні пропуску", 500);
    }
});

// оновити пропуск
app.put("/api/passes/:id", async (req, res) => {
    try {
        const passId = Number(req.params.id);
        const { userId, reasonId, date, status } = req.body;

        // перевірка id маршруту
        if (!Number.isFinite(passId)) {
            return fail(res, "Некоректний id пропуску", 400);
        }

        // перевірка userId
        if (!userId || Number.isNaN(Number(userId))) {
            return fail(res, "Поле userId обов'язкове", 400);
        }

        // перевірка date
        if (!date || typeof date !== "string" || date.trim().length < 2) {
            return fail(res, "Поле date обов'язкове", 400);
        }

        // перевірка status
        if (!status || typeof status !== "string" || status.trim().length < 2) {
            return fail(res, "Поле status обов'язкове", 400);
        }

        const numericUserId = Number(userId);

        // перевірка, чи існує користувач
        const existingUser = await get(`
            SELECT id FROM Users WHERE id = ${numericUserId};
        `);

        if (!existingUser) {
            return fail(res, "Користувача не існує", 400);
        }

        const safeDate = date.trim().replace(/'/g, "''");
        const safeStatus = status.trim().replace(/'/g, "''");

        // reasonId може бути NULL
        let safeReasonId = "NULL";
        if (reasonId !== undefined && reasonId !== null && reasonId !== "") {
            const numericReasonId = Number(reasonId);

            if (Number.isNaN(numericReasonId)) {
                return fail(res, "reasonId має бути числом", 400);
            }

            safeReasonId = numericReasonId;
        }

        // оновлення пропуску
        const result = await run(`
            UPDATE Passes
            SET userId = ${numericUserId},
                reasonId = ${safeReasonId},
                date = '${safeDate}',
                status = '${safeStatus}'
            WHERE id = ${passId};
        `);

        // якщо пропуск не знайдено
        if (result.changes === 0) {
            return fail(res, "Пропуск не знайдено", 404);
        }

        // дістаємо оновлений запис
        const updatedPass = await get(`
            SELECT id, userId, reasonId, date, status
            FROM Passes
            WHERE id = ${passId};
        `);

        return success(res, updatedPass);
    } catch (err) {
        return fail(res, "Помилка при оновленні пропуску", 500);
    }
});

// видалити пропуск
app.delete("/api/passes/:id", async (req, res) => {
    try {
        const passId = Number(req.params.id);

        // перевірка id
        if (!Number.isFinite(passId)) {
            return fail(res, "Некоректний id пропуску", 400);
        }

        // видалення пропуску
        const result = await run(`
            DELETE FROM Passes
            WHERE id = ${passId};
        `);

        // якщо пропуск не знайдено
        if (result.changes === 0) {
            return fail(res, "Пропуск не знайдено", 404);
        }

        return success(res, { deleted: true });
    } catch (err) {
        return fail(res, "Помилка при видаленні пропуску", 500);
    }
});


// ======================================================
// REASONS
// ======================================================

// отримати список причин
app.get("/api/reasons", async (req, res) => {
    try {
        const reasons = await all(`
            SELECT id, title, description
            FROM Reasons
            ORDER BY id DESC;
        `);

        return success(res, reasons);
    } catch (err) {
        return fail(res, "Помилка при отриманні причин", 500);
    }
});

// отримати причину за id
app.get("/api/reasons/:id", async (req, res) => {
    try {
        const reasonId = Number(req.params.id);

        if (!Number.isFinite(reasonId)) {
            return fail(res, "Некоректний id причини", 400);
        }

        const reason = await get(`
            SELECT id, title, description
            FROM Reasons
            WHERE id = ${reasonId};
        `);

        if (!reason) {
            return fail(res, "Причину не знайдено", 404);
        }

        return success(res, reason);
    } catch (err) {
        return fail(res, "Помилка при отриманні причини", 500);
    }
});

// створити причину
app.post("/api/reasons", async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || typeof title !== "string" || title.trim().length < 2) {
            return fail(res, "Поле title обов'язкове", 400);
        }

        const safeTitle = title.trim().replace(/'/g, "''");
        const safeDescription =
            typeof description === "string"
                ? description.trim().replace(/'/g, "''")
                : "";

        const result = await run(`
            INSERT INTO Reasons (title, description)
            VALUES ('${safeTitle}', '${safeDescription}');
        `);

        const createdReason = await get(`
            SELECT id, title, description
            FROM Reasons
            WHERE id = ${result.lastID};
        `);

        return success(res, createdReason, 201);
    } catch (err) {
        return fail(res, "Помилка при створенні причини", 500);
    }
});

// оновити причину
app.put("/api/reasons/:id", async (req, res) => {
    try {
        const reasonId = Number(req.params.id);
        const { title, description } = req.body;

        if (!Number.isFinite(reasonId)) {
            return fail(res, "Некоректний id причини", 400);
        }

        if (!title || typeof title !== "string" || title.trim().length < 2) {
            return fail(res, "Поле title обов'язкове", 400);
        }

        const safeTitle = title.trim().replace(/'/g, "''");
        const safeDescription =
            typeof description === "string"
                ? description.trim().replace(/'/g, "''")
                : "";

        const result = await run(`
            UPDATE Reasons
            SET title = '${safeTitle}',
                description = '${safeDescription}'
            WHERE id = ${reasonId};
        `);

        if (result.changes === 0) {
            return fail(res, "Причину не знайдено", 404);
        }

        const updatedReason = await get(`
            SELECT id, title, description
            FROM Reasons
            WHERE id = ${reasonId};
        `);

        return success(res, updatedReason);
    } catch (err) {
        return fail(res, "Помилка при оновленні причини", 500);
    }
});

// видалити причину
app.delete("/api/reasons/:id", async (req, res) => {
    try {
        const reasonId = Number(req.params.id);

        if (!Number.isFinite(reasonId)) {
            return fail(res, "Некоректний id причини", 400);
        }

        const result = await run(`
            DELETE FROM Reasons
            WHERE id = ${reasonId};
        `);

        if (result.changes === 0) {
            return fail(res, "Причину не знайдено", 404);
        }

        return success(res, { deleted: true });
    } catch (err) {
        return fail(res, "Помилка при видаленні причини", 500);
    }
});


// ======================================================
// LOGS
// ======================================================

// отримати список логів
app.get("/api/logs", async (req, res) => {
    try {
        const logs = await all(`
            SELECT id, action, entity, entityId
            FROM Logs
            ORDER BY id DESC;
        `);

        return success(res, logs);
    } catch (err) {
        return fail(res, "Помилка при отриманні логів", 500);
    }
});

// отримати лог за id
app.get("/api/logs/:id", async (req, res) => {
    try {
        const logId = Number(req.params.id);

        if (!Number.isFinite(logId)) {
            return fail(res, "Некоректний id логу", 400);
        }

        const log = await get(`
            SELECT id, action, entity, entityId
            FROM Logs
            WHERE id = ${logId};
        `);

        if (!log) {
            return fail(res, "Лог не знайдено", 404);
        }

        return success(res, log);
    } catch (err) {
        return fail(res, "Помилка при отриманні логу", 500);
    }
});

// створити лог
app.post("/api/logs", async (req, res) => {
    try {
        const { action, entity, entityId } = req.body;

        if (!action || typeof action !== "string" || action.trim().length < 2) {
            return fail(res, "Поле action обов'язкове", 400);
        }

        if (!entity || typeof entity !== "string" || entity.trim().length < 2) {
            return fail(res, "Поле entity обов'язкове", 400);
        }

        if (!entityId || Number.isNaN(Number(entityId))) {
            return fail(res, "Поле entityId обов'язкове", 400);
        }

        const safeAction = action.trim().replace(/'/g, "''");
        const safeEntity = entity.trim().replace(/'/g, "''");
        const numericEntityId = Number(entityId);

        const result = await run(`
            INSERT INTO Logs (action, entity, entityId)
            VALUES ('${safeAction}', '${safeEntity}', ${numericEntityId});
        `);

        const createdLog = await get(`
            SELECT id, action, entity, entityId
            FROM Logs
            WHERE id = ${result.lastID};
        `);

        return success(res, createdLog, 201);
    } catch (err) {
        return fail(res, "Помилка при створенні логу", 500);
    }
});

// оновити лог
app.put("/api/logs/:id", async (req, res) => {
    try {
        const logId = Number(req.params.id);
        const { action, entity, entityId } = req.body;

        if (!Number.isFinite(logId)) {
            return fail(res, "Некоректний id логу", 400);
        }

        if (!action || typeof action !== "string" || action.trim().length < 2) {
            return fail(res, "Поле action обов'язкове", 400);
        }

        if (!entity || typeof entity !== "string" || entity.trim().length < 2) {
            return fail(res, "Поле entity обов'язкове", 400);
        }

        if (!entityId || Number.isNaN(Number(entityId))) {
            return fail(res, "Поле entityId обов'язкове", 400);
        }

        const safeAction = action.trim().replace(/'/g, "''");
        const safeEntity = entity.trim().replace(/'/g, "''");
        const numericEntityId = Number(entityId);

        const result = await run(`
            UPDATE Logs
            SET action = '${safeAction}',
                entity = '${safeEntity}',
                entityId = ${numericEntityId}
            WHERE id = ${logId};
        `);

        if (result.changes === 0) {
            return fail(res, "Лог не знайдено", 404);
        }

        const updatedLog = await get(`
            SELECT id, action, entity, entityId
            FROM Logs
            WHERE id = ${logId};
        `);

        return success(res, updatedLog);
    } catch (err) {
        return fail(res, "Помилка при оновленні логу", 500);
    }
});

// видалити лог
app.delete("/api/logs/:id", async (req, res) => {
    try {
        const logId = Number(req.params.id);

        if (!Number.isFinite(logId)) {
            return fail(res, "Некоректний id логу", 400);
        }

        const result = await run(`
            DELETE FROM Logs
            WHERE id = ${logId};
        `);

        if (result.changes === 0) {
            return fail(res, "Лог не знайдено", 404);
        }

        return success(res, { deleted: true });
    } catch (err) {
        return fail(res, "Помилка при видаленні логу", 500);
    }
});

// запускаємо сервер тільки після виконання міграцій
async function startServer() {
    try {
        await migrate();

        app.listen(PORT, () => {
            console.log(`Server запущений на http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Помилка запуску сервера:", err);
    }
}

startServer();