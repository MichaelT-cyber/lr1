// обгортки над SQLite, щоб працювати через Promise
// тепер функції приймають не тільки SQL, а й params
// params потрібні для параметризованих запитів і захисту від SQL Injection

const { db } = require("./db");

// отримати список рядків
function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        });
    });
}

// отримати один рядок
function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                return reject(err);
            }

            resolve(row);
        });
    });
}

// виконати INSERT / UPDATE / DELETE
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                return reject(err);
            }

            resolve({
                lastID: this.lastID,
                changes: this.changes
            });
        });
    });
}

module.exports = { all, get, run };