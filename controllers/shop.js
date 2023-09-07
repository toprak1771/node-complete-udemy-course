const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = async (req, res, next) => {
  await Product.findAll().then((response) => {
    //console.log("response:",response);
    res.render("shop/product-list", {
      prods: response,
      pageTitle: "All Products",
      path: "/products",
    });
  }).catch((err) => {
    console.log(err);
  });
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  await Product.findByPk(prodId)
    .then((response) => {
      console.log(response.title);
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
  await Product.findAll().then((response) => {
    //console.log("response:",response);
    res.render("shop/index", {
             prods: response,
             pageTitle: "Shop",
             path: "/",
           });
  }).catch((err) => {
    console.log(err);
  });
};

exports.getCart = (req, res, next) => {
  Cart.getCart((cart) => {
    Product.fetchAll((products) => {
      const cartProducts = [];
      for (product of products) {
        const cartProductData = cart.products.find(
          (prod) => prod.id === product.id
        );
        if (cartProductData) {
          cartProducts.push({ productData: product, qty: cartProductData.qty });
        }
      }
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: cartProducts,
      });
    });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    Cart.addProduct(prodId, product.price);
  });
  res.redirect("/cart");
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    Cart.deleteProduct(prodId, product.price);
    res.redirect("/cart");
  });
};

exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    path: "/orders",
    pageTitle: "Your Orders",
  });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
