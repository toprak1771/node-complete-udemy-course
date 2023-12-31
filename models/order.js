const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Order =  sequelize.define('Order',{
  id:{
    type:Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull:false,
  },
});

module.exports = Order;