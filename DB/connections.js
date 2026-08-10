require('dotenv').config();
const mysql = require("mysql2");

// -------------------------------------//
//   conect to database dana-cermat   //
// -------------------------------------//

const connectDB = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: "",
    database: process.env.DB_NAME
});

exports.Database = connectDB.connect((err) => {
    if (err) {
        console.error("Database gagal konek:", err);
        return;
    }
    
    console.log("Database berhasil terkoneksi");
});

module.exports = connectDB;