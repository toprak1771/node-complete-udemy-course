const mongoose = require("mongoose");
const Product = require('./product');
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

userSchema.methods.getCart = function() {
  const productIds = this?.cart?.items.map((item) => {
    return item.productId;
  });
  console.log("productIds:", productIds);
  return Product.find({_id:{$in:productIds}}).then((products) => {
    console.log("products:",products);
    return products?.map((p) => {
      return {
        ...p,
        quantity:this.cart?.items?.find((product) => {
          return product.productId.toString() === p._id.toString();
        }).quantity,
      };
    })
  }).catch((err) => console.log(err));
}

module.exports = mongoose.model("User", userSchema);
