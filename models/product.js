// const db = require('../util/database')
// const Cart = require('./cart');
const Sequelize = require('sequelize');
const sequelize = require('../util/database');


// module.exports = class Product {
//    constructor(id, title, imageUrl, description, price) {
//      this.id = id;
//      this.title = title;
//      this.imageUrl = imageUrl;
//      this.description = description;
//      this.price = price;
//    }

const Product =  sequelize.define('Product',{
  id:{
    type:Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull:false,
  },
  title:Sequelize.STRING,
  price:{
    type:Sequelize.DOUBLE,
    allowNull:false,
  },
  İmageUrl:{
    type:Sequelize.STRING,
    allowNull:false
  },
  description:{
    type:Sequelize.STRING,
    allowNull:false
  }
});

module.exports = Product;
//   save() {
//    return db.execute('INSERT INTO products (title,price,description,imageUrl) VALUES (?,?,?,?)',[this.title,this.price,this.description,this.imageUrl]);
//   }

//   static deleteById(id) {
   
//   }

//   static fetchAll() {
//     return db.execute('SELECT * FROM products')
//   }

//   static findById(id) {
//     return db.execute('SELECT * FROM products WHERE id = ?',[id])
//   }
// };
