const Product = require("../models/product");
const Cart = require("../models/cart");
const CartItem = require("../models/cart-item");
const redis = require("redis");

//redis
var client = redis.createClient({
  legacyMode: true,
});
let redisError;
client
  .connect()
  .then(() => {
    // client.set("user_name", "Toprak", (error, message) => {
    //   if (error) {
    //     console.log("error:", error);
    //   }
    //   console.log("Message:", message);
    // });
    // //GET
    // client.get("user_name", (error, message) => {
    //   if (error) {
    //     console.log("error:", error);
    //   }
    //   console.log("Message:", message);
    // });
  })
  .catch((err) => {
    console.log("redis_error_main:", err);
    redisError = err;
  });

exports.getProducts = async (req, res, next) => {
  if (redisError == null || !redisError) {
    client.keys("Product*", (err, keys) => {
      console.log("keys:", keys);
      if (err) return console.log(err);
      if (keys.length > 0) {
        const productList = [];
        keys.forEach((redisKey) => {
          //console.log("redisKey:", redisKey);
          client.get(redisKey, (err, product) => {
            productList.push(JSON.parse(product));
            if (productList.length === keys.length) {
              console.log("productList:", productList);
              res.render("shop/product-list", {
                prods: productList,
                pageTitle: "All Products",
                path: "/products",
              });
            }
          });
        });
      } else {
        let counter = 0;
        Product.findAll().then((response) => {
          console.log("response:", response);
          response.forEach((product) => {
            //console.log("productTitle:", product.title);
            product.fullName = product.title + "" + product.description;
            //console.log("product:",product);
            let productName = "Product" + product.id;
            console.log("productkey:", productName);
            client.get(productName, (err, key_product) => {
              if (err) {
                console.log("err:", err);
              }
              if (key_product == null) {
                let data = JSON.stringify(product);
                console.log("data:", data);
                client.set(productName, data, (err, message) => {
                  console.log("message:", message);
                });
              } else {
                console.log(JSON.parse(key_product));
              }
            });
          });
          res.render("shop/product-list", {
            prods: response,
            pageTitle: "All Products",
            path: "/products",
          });
        });
      }
    });
  } else if (redisError) {
    await Product.findAll()
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
  }
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  await Product.findByPk(prodId)
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
  console.log("redisError=", typeof redisError);
  // await Cart.findByPk(1).then((cart) => {
  //   cart.getUser().then((user)=> {
  //     console.log("user:",user)
  //   }).catch((err) => console.log(err))
  // }).catch((err) => console.log(err));

  await Product.findAll()
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
    .then((cart) => {
      cart
        .getProducts()
        .then((products) => {
          res.render("shop/cart", {
            path: "/cart",
            pageTitle: "Your Cart",
            products: products,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
  // Cart.getCart((cart) => {
  //   Product.fetchAll((products) => {
  //     const cartProducts = [];
  //     for (product of products) {
  //       const cartProductData = cart.products.find(
  //         (prod) => prod.id === product.id
  //       );
  //       if (cartProductData) {
  //         cartProducts.push({ productData: product, qty: cartProductData.qty });
  //       }
  //     }
  //     res.render("shop/cart", {
  //       path: "/cart",
  //       pageTitle: "Your Cart",
  //       products: cartProducts,
  //     });
  //   });
  // });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;

  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        //ürün miktarını 1 artırmak
        const oldQuantity = product?.CartItem.quantity;
        newQuantity = oldQuantity + 1;
        fetchedCart
          .addProduct(product, { through: { quantity: newQuantity } })
          .then((result) => {
            console.log("Product added successfully.");
            res.redirect("/cart");
          })
          .catch((err) => console.log(err));
      } else {
        return Product.findByPk(prodId)
          .then((product) => {
            return fetchedCart.addProduct(product, {
              through: { quantity: newQuantity },
            });
          })
          .catch((err) => console.log(err));
      }
    })
    .then((result) => {
      console.log("Product added successfully.");
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));

  // Product.findById(prodId, (product) => {
  //   Cart.addProduct(prodId, product.price);
  // });
  // res.redirect("/cart");
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      const product = products[0];
      if (product) {
        console.log("product:", product);
        return product.CartItem.destroy();
      }
    })
    .then((result) => {
      console.log("Product has been deleted in cart");
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      //farklı yol --->
      // return req.user
      // .createOrder()
      // .then(order => {
      //   return order.addProducts(
      //     products.map(product => {
      //       product.orderItem = { quantity: product.cartItem.quantity };
      //       return product;
      //     })
      //   );
      // })
      // .catch(err => console.log(err));

      req.user.createOrder().then((order) => {
        products.forEach((product) => {
          return order.addProduct(product, {
            through: { quantity: product.CartItem.quantity },
          });
        });
      });
    })
    .then((result) => {
      //farklı yol --->
      // return fetchedCart.setProducts(null);

      console.log("cart:", fetchedCart);
      return CartItem.destroy({ where: { CartId: fetchedCart.id } });
    })
    .then((lastResult) => {
      console.log("order has completed successfully.");
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({ include: ["Products"] })
    .then((orders) => {
      console.log("orders:", orders);
      res.render("shop/orders", {
        path: "/orders",
        orders: orders,
        pageTitle: "Your Orders",
      });
    })
    .catch((err) => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
