// const mysql = require('mysql2');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete','root','toprak1735.',{
    dialect:'mysql',
    host:'localhost',
});

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node-complete',
//     password: ''
// });

module.exports = sequelize;

// module.exports = pool.promise();