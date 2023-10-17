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

  getCart() {
    const db = getDb();
    const productIds = this?.cart?.items.map((item) => {
      return item.productId;
    });
    console.log("productIds:", productIds);
    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        console.log("products:", products);
        return products?.map((p) => {
          return {
            ...p,
            quantity: this.cart?.items?.find((product) => {
              return product.productId.toString() === p._id.toString();
            }).quantity,
          };
        });
      })
      .catch((err) => console.log(err));
  }

  addtoCart(product) {
    const db = getDb();
    console.log("product._id", product._id);
    const updatedProduct = this.cart?.items?.find((up) => {
      console.log("up:", up.productId);
      return up.productId.toString() === product._id.toString();
    });
    console.log("updatedProduct:", updatedProduct);
    let updatedItems = [...this.cart.items];
    if (updatedProduct) {
      const newItemList = this.cart?.items?.filter(
        (item) => item.productId !== updatedProduct.productId
      );
      updatedItems = [
        ...newItemList,
        {
          productId: new mongoDb.ObjectId(updatedProduct.productId),
          quantity: updatedProduct.quantity + 1,
        },
      ];
    } else {
      updatedItems.push({
        productId: new mongoDb.ObjectId(product._id),
        quantity: 1,
      });
    }
    return db
      .collection("users")
      .updateOne(
        { _id: new mongoDb.ObjectId(this._id) },
        {
          $set: {
            cart: {
              items: updatedItems,
            },
          },
        }
      )
      .then((result) => {
        console.log("add to cart");
      })
      .catch((err) => console.log(err));
  }

  deleteItemFromCart(productId) {
    const db = getDb();
    const updatedItems = this?.cart?.items?.filter(
      (item) => item.productId.toString() !== productId.toString()
    );
    console.log("updatedItems:", updatedItems);

    return db
      .collection("users")
      .updateOne(
        { _id: new mongoDb.ObjectId(this._id) },
        { $set: { cart: { items: updatedItems } } }
      )
      .then((result) => {
        console.log("delete item from cart");
      })
      .catch((err) => console.log(err));
  }
}

module.exports = User;
