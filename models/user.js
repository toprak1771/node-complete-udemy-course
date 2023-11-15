const mongoose = require("mongoose");
const Product = require("./product");

const Order = require("./order");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  mail: {
    type: String,
    required: true,
    unique: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const updatedProduct = this.cart?.items?.find((up) => {
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
        productId: updatedProduct.productId,
        quantity: updatedProduct.quantity + 1,
      },
    ];
  } else {
    updatedItems.push({
      productId: product._id,
      quantity: 1,
    });
  }
  const updatedCart = {
    items: updatedItems,
  };
  this.cart = updatedCart;
  return this.save();
};

//like a pure mongo db,long path
userSchema.methods.getCart = function () {
  const productIds = this?.cart?.items.map((item) => {
    return item.productId;
  });
  console.log("productIds:", productIds);
  return Product.find({ _id: { $in: productIds } })
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
};

userSchema.methods.removeCart = async function (productId) {
  console.log("productId:", productId);
  const updatedItems = this.cart.items.filter((product) => {
    console.log("product:", product);
    return product.productId.toString() != productId.toString();
  });
  console.log("updatedItems:", updatedItems);
  this.cart.items = updatedItems;
  console.log("this.cart.items:", this.cart.items);
  return this.save();
};

userSchema.methods.addOrder = async function () {
  let products = this.cart.items;
  const productsIds = products.map((product) => product.productId);
  const user = {
    name: this.name,
    userId: this._id,
  };
  console.log("productsIds:", productsIds);
  return await Product.find({ _id: { $in: productsIds } })
    .then(async (_products) => {
      const newProducts = _products.map((_product) => {
        return {
          product: _product,
          quantity: this.cart?.items?.find((_cartproduct) => {
            return _cartproduct.productId.toString() === _product._id.toString();
          }).quantity,
        };
      });
      console.log("newProducts=", newProducts);
      return await Order.create({
        user: user,
        products: newProducts,
      });
    })
    .then((result) => {
      this.cart.items = [];
      return this.save();
    })
    .catch((err) => console.log(err));
};

module.exports = mongoose.model("User", userSchema);
