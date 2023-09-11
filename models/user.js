const Sequelize = require('sequelize');
const sequelize = require('../util/database');


const User = sequelize.define('user',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull:false,
      },
      userName:{
        type:Sequelize.STRING,
        allowNull:false,
      },
      mail:{
        type:Sequelize.STRING,
        allowNull:false
      } 
});

module.exports = User;