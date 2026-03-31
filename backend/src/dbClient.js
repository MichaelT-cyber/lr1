// обгортки над SQLite, щоб працювати через Promise

const { db } = require("./db");

// отримати список рядків
function all(sql) {
    return new Promise((resolve, reject) => {
        db.all(sql, (err, rows) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        });
    });
}

// отримати один рядок
function get(sql) {
    return new Promise((resolve, reject) => {
        db.get(sql, (err, row) => {
            if (err) {
                return reject(err);
            }

            resolve(row);
        });
    });
}

// виконати INSERT / UPDATE / DELETE
function run(sql) {
    return new Promise((resolve, reject) => {
        db.run(sql, function (err) {
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