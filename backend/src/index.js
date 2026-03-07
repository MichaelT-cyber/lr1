// підключаємо express
const express = require("express");

// створюємо сервер
const app = express();

// порт сервера
const PORT = 3000;

// дозволяємо читати JSON
app.use(express.json());

/*
  Тимчасове сховище даних у пам'яті.
  Це заміна бази даних для лабораторної роботи.
  Після перезапуску сервера дані зникнуть — і це нормально для цієї ЛР.
*/
let users = [];

/*
  Тестовий маршрут
*/
app.get("/", (req, res) => {
    res.json({ message: "Server працює" });
});

/*
  GET /api/users
  Отримати список усіх користувачів
*/
app.get("/api/users", (req, res) => {
    res.status(200).json(users);
});

/*
  GET /api/users/:id
  Отримати одного користувача за id
*/
app.get("/api/users/:id", (req, res) => {
    const userId = Number(req.params.id);

    const user = users.find((u) => u.id === userId);

    if (!user) {
        return res.status(404).json({ message: "Користувача не знайдено" });
    }

    res.status(200).json(user);
});

/*
  POST /api/users
  Створити нового користувача
*/
app.post("/api/users", (req, res) => {
    const { fullName, role, isActive } = req.body;

    // мінімальна валідація
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
        return res.status(400).json({
            message: "Поле fullName обов'язкове і має містити мінімум 2 символи"
        });
    }

    if (!role || typeof role !== "string" || role.trim().length < 2) {
        return res.status(400).json({
            message: "Поле role обов'язкове і має містити мінімум 2 символи"
        });
    }

    const newUser = {
        id: Date.now(),
        fullName: fullName.trim(),
        role: role.trim(),
        isActive: typeof isActive === "boolean" ? isActive : true
    };

    users.push(newUser);

    res.status(201).json(newUser);
});

/*
  PUT /api/users/:id
  Оновити користувача
*/
app.put("/api/users/:id", (req, res) => {
    const userId = Number(req.params.id);
    const { fullName, role, isActive } = req.body;

    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ message: "Користувача не знайдено" });
    }

    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
        return res.status(400).json({
            message: "Поле fullName обов'язкове і має містити мінімум 2 символи"
        });
    }

    if (!role || typeof role !== "string" || role.trim().length < 2) {
        return res.status(400).json({
            message: "Поле role обов'язкове і має містити мінімум 2 символи"
        });
    }

    users[userIndex] = {
        ...users[userIndex],
        fullName: fullName.trim(),
        role: role.trim(),
        isActive: typeof isActive === "boolean" ? isActive : users[userIndex].isActive
    };

    res.status(200).json(users[userIndex]);
});

/*
  DELETE /api/users/:id
  Видалити користувача
*/
app.delete("/api/users/:id", (req, res) => {
    const userId = Number(req.params.id);

    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ message: "Користувача не знайдено" });
    }

    users.splice(userIndex, 1);

    res.status(204).send();
});

/*
  запуск сервера
*/
app.listen(PORT, () => {
    console.log(`Server запущений на http://localhost:${PORT}`);
});