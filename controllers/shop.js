const Product = require("../models/product");
//const Cart = require("../models/cart");
//const CartItem = require("../models/cart-item");

exports.getProducts = async (req, res, next) => {
  const product = new Product();
  await product
    .fetchAll()
    .then((response) => {
      res.render("shop/product-list", {
        prods: response,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  const product = new Product();
  await product
    .findById(prodId)
    .then((response) => {
      res.render("shop/product-detail", {
        product: response,
        pageTitle: response.title,
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getIndex = async (req, res, next) => {
  // await Cart.findByPk(1).then((cart) => {
  //   cart.getUser().then((user)=> {
  //     console.log("user:",user)
  //   }).catch((err) => console.log(err))
  // }).catch((err) => console.log(err));
  const product = new Product();
  await product
    .fetchAll()
    .then((response) => {
      res.render("shop/index", {
        prods: response,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((products) => {
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCart = async (req, res, next) => {
  const prodId = req.body.productId;
  // let fetchedCart;
  // let newQuantity = 1;
  const product = new Product();
  await product
    .findById(prodId)
    .then((product) => {
      req.user
        .addtoCart(product)
        .then((result) => {
          console.log("Product added successfully.");
          res.redirect("/cart");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));

  // req.user
  //   .getCart()
  //   .then((cart) => {
  //     fetchedCart = cart;
  //     return cart.getProducts({ where: { id: prodId } });
  //   })
  //   .then((products) => {
  //     let product;
  //     if (products.length > 0) {
  //       product = products[0];
  //     }
  //     if (product) {
  //       //ürün miktarını 1 artırmak
  //       const oldQuantity = product?.CartItem.quantity;
  //       newQuantity = oldQuantity + 1;
  //       fetchedCart
  //         .addProduct(product, { through: { quantity: newQuantity } })
  //         .then((result) => {
  //           console.log("Product added successfully.");
  //           res.redirect("/cart");
  //         })
  //         .catch((err) => console.log(err));
  //     } else {
  //       return Product.findByPk(prodId)
  //         .then((product) => {
  //           return fetchedCart.addProduct(product, {
  //             through: { quantity: newQuantity },
  //           });
  //         })
  //         .catch((err) => console.log(err));
  //     }
  //   })
  //   .then((result) => {
  //     console.log("Product added successfully.");
  //     res.redirect("/cart");
  //   })
  //   .catch((err) => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteItemFromCart(prodId)
    .then((result) => {
      console.log("Product has been deleted in cart");
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

// exports.postOrder = (req, res, next) => {
//   let fetchedCart;
//   req.user
//     .getCart()
//     .then((cart) => {
//       fetchedCart = cart;
//       return cart.getProducts();
//     })
//     .then((products) => {
//       //farklı yol --->
//       // return req.user
//       // .createOrder()
//       // .then(order => {
//       //   return order.addProducts(
//       //     products.map(product => {
//       //       product.orderItem = { quantity: product.cartItem.quantity };
//       //       return product;
//       //     })
//       //   );
//       // })
//       // .catch(err => console.log(err));

//       req.user.createOrder().then((order) => {
//         products.forEach((product) => {
//           return order.addProduct(product, {
//             through: { quantity: product.CartItem.quantity },
//           });
//         });
//       });
//     })
//     .then((result) => {
//       //farklı yol --->
//       // return fetchedCart.setProducts(null);

//       console.log("cart:", fetchedCart);
//       return CartItem.destroy({ where: { CartId: fetchedCart.id } });
//     })
//     .then((lastResult) => {
//       console.log("order has completed successfully.");
//       res.redirect("/orders");
//     })
//     .catch((err) => console.log(err));
// };

// exports.getOrders = (req, res, next) => {
//   req.user
//     .getOrders({ include: ["Products"] })
//     .then((orders) => {
//       console.log("orders:",orders);
//       res.render("shop/orders", {
//         path: "/orders",
//         orders: orders,
//         pageTitle: "Your Orders",
//       });
//     })
//     .catch((err) => console.log(err));
// };

// exports.getCheckout = (req, res, next) => {
//   res.render("shop/checkout", {
//     path: "/checkout",
//     pageTitle: "Checkout",
//   });
// };
