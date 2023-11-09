// const mysql = require('mysql2');

const Sequelize = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DATABASE_SQL_NAME,
  "root",
  process.env.DATABASE_SQL_PASSWORD,
  {
    dialect: "mysql",
    host: "localhost",
  }
);

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node-complete',
//     password: ''
// });

module.exports = sequelize;

// module.exports = pool.promise();
