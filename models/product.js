// const db = require('../util/database')

// const Cart = require('./cart');
const getDb = require("./../util/database").getDb;
const mongoDb = require('mongodb');

class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    const db = getDb();
    return db
      .collection("products")
      .insertOne(this)
      .then((result) => console.log(result))
      .catch((err) => console.log(err));
  }

  fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find({})
      .toArray()
      .then((products) => {
        console.log(products);
        return products;
      })
      .catch((err) => console.log(err));
  }

  findById(id) {
    const db = getDb();
    return db
      .collection("products")
      .find({ _id: new mongoDb.ObjectId(id) })
      .next()
      .then((product) => {
        console.log("product:", product);
        return product;
      })
      .catch((err) => console.log(err));
  }
}

module.exports = Product;
