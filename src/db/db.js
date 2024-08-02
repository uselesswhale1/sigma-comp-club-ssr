const mysql = require("mysql2");
require("dotenv").config()

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_USER_PASSWORD,
  database: process.env.DB_DATABASE_NAME,
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("db connect");
});

module.exports = db;