require('dotenv').config();
const mysql = require("mysql2");

const connectDB = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

connectDB.connect((err) => {
    if (err) {
        console.error("Database gagal konek:", err);
        return;
    }

    console.log("Database berhasil terkoneksi");
});

module.exports = connectDB;