const Product = require("../models/product");
const redis = require("redis");

//redis
var client = redis.createClient({
  legacyMode: true,
});
let redisError;
client
  .connect()
  .then(() => {})
  .catch((err) => {
    console.log("redis_error_main:", err);
    redisError = err;
  });

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  await Product.create({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
    userId: req.user.id,
  })
    .then((response) => {
      if (redisError == null || !redisError) {
        //console.log("response:", response.id);
        const productName = "Product" + response.id;
        var data = JSON.stringify(response);
        client.set(productName, data, (red_err, message) => {
          if (red_err) {
            console.log("err:", red_err);
          }
          console.log("redis_message:", message);
        });
      }
      res.redirect("/admin/products");

      //console.log(response)
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  req.user
    .getProducts({ where: { id: prodId } })
    .then((products) => {
      console.log("products:", products);
      const product = products[0];
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  Product.findByPk(prodId)
    .then((product) => {
      console.log("product:", product);
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.imageUrl = updatedImageUrl;
      product.description = updatedDesc;
      return product.save();
    })
    .then((response) => {
      if (redisError == null || !redisError) {
        const productName = "Product" + response.id;
        var data = JSON.stringify(response);
        client.set(productName, data, (red_err, message) => {
          if (red_err) {
            console.log("err:", red_err);
          }
          console.log("redis_message:", message);
        });
      }
      console.log("Product updated!!!");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  req.user
    .getProducts()
    .then((response) => {
      res.render("admin/products", {
        prods: response,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
    .then((product) => {
      return product.destroy();
    })
    .then((response) => {
      if (redisError == null || !redisError) {
        //console.log("response:", response.id);
        const productName = "Product" + response.id;
        client.del(productName, function (redis_err, redis_message) {
          if (redis_err) {
            console.log("redis_err:", redis_err);
          }
          console.log("redis_message:", redis_message);
        });
      }
      console.log("Product deleted!!!");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
