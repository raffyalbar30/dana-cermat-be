const mysql = require("mysql2");

const connectDB = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "dana-cermat"
});

exports.Database = connectDB.connect((err) => {
    if (err) {
        console.error("Database gagal konek:", err);
        return;
    }
    
    console.log("Database berhasil terkoneksi");
});

module.exports = connectDB;