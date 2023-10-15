const getDb = require("./../util/database").getDb;
const mongoDb = require("mongodb");

class User {
  constructor(userName, mail, cart, id) {
    this.userName = userName;
    this.mail = mail;
    this.cart = cart; // items:[{product,quantity}]
    this._id = id;
  }

  save() {
    const db = getDb();
    return db
      .collection("users")
      .insertOne(this)
      .then((result) => console.log(result))
      .catch((err) => console.log(err));
  }

  static findById(id) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new mongoDb.ObjectId(id) })
      .then((user) => {
        console.log("user:", user);
        return user;
      })
      .catch((err) => console.log(err));
  }

  addtoCart(product) {
    const db = getDb();
    return db
      .collection("users")
      .updateOne(
        { _id: new mongoDb.ObjectId(this._id) },
        { $set: { cart: [{ productId: new mongoDb.ObjectId(product._id),quantity:1 }] } }
      )
      .then((result) => {
        console.log("add to cart")
      })
      .catch((err) => console.log(err));
  }
}

module.exports = User;
