const Product = require("../models/product");
//const Cart = require("../models/cart");
//const CartItem = require("../models/cart-item");
const User = require("../models/user");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  console.log("loggedIn:",req.session.loggedIn);
  console.log("req.session:",req.session);
  Product.find()
    // .select("title price -_id")
    // .populate("userId", "name")
    .then((response) => {
      //console.log("products:", response);
      res.render("shop/product-list", {
        prods: response,
        pageTitle: "All Products",
        path: "/products",
        isAuthenticated:req.session.loggedIn ?? false
      });
    })
    .catch((err) => {
      console.log('An error occured!');
      console.log(err.message);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;

  await Product.findById(prodId)
    .then((response) => {
      res.render("shop/product-detail", {
        product: response,
        pageTitle: response.title,
        path: "/products",
        isAuthenticated:req.session.loggedIn ?? false
      });
    })
    .catch((err) => {
      console.log('An error occured!');
      console.log(err.message);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = async (req, res, next) => {
  await Product.find()
    .then((response) => {
      res.status(200).render("shop/index", {
        prods: response,
        pageTitle: "Shop",
        path: "/",
        isAuthenticated:req.session.loggedIn ?? false
      });
    })
    .catch((err) => {
      console.log('An error occured!');
      console.log(err.message);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart =  (req, res, next) => {
  console.log("req.session.user:",req.session.user);
   req.user
    .populate("cart.items.productId")
    // await req.user
    //   .getCart()  this is also work but long path
    .then((user) => {
      console.log("user:",user);
      const products = user.cart.items;
      console.log("products:",products);
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        isAuthenticated:req.session.loggedIn ?? false
      });
    })
    .catch((err) => {
      console.log('An error occured!');
      console.log(err.message);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = async (req, res, next) => {
  const prodId = req.body.productId;
  await Product.findById(prodId)
    .then((product) => {
      console.log("product:", product);
      return req.user
        .addToCart(product)
        .then((result) => {
          console.log("Product added successfully.");
          res.redirect("/cart");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      console.log('An error occured!');
      console.log(err.message);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeCart(prodId)
    .then((result) => {
      console.log("result:", result);
      console.log("Product has been deleted in cart");
      res.redirect("/cart");
      
    })
    .catch((err) => {
      console.log('An error occured!');
      console.log(err.message);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .addOrder()
    .then((result) => {
      console.log(result);
      console.log("order operation is completed.");
      res.redirect("/orders");
    })
    .catch((err) => {
      console.log('An error occured!');
      console.log(err.message);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.session.user._id })
    .then((orders) => {
      console.log("orders:", orders);
      res.render("shop/orders", {
        path: "/orders",
        orders: orders,
        pageTitle: "Your Orders",
        isAuthenticated:req.session.loggedIn ?? false
      });
    })
    .catch((err) => {
      console.log('An error occured!');
      console.log(err.message);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// exports.getCheckout = (req, res, next) => {
//   res.render("shop/checkout", {
//     path: "/checkout",
//     pageTitle: "Checkout",
//   });
// };
