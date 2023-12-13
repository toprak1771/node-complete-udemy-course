const product = require("../models/product");
const Product = require("../models/product");
const { validationResult } = require("express-validator");
const mongoose = require('mongoose');

exports.getAddProduct = (req, res, next) => {
  const errors = validationResult(req);
  console.log("errors:", errors.array());
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.session.loggedIn ?? false,
    errorMessage: '',
    validationErrors: [],
    oldInput: { title: "", imageUrl: "", price: "", description: "" },
  });
};

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);
  console.log("errors:", errors.array());
  if (!errors.isEmpty()) {
    res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      isAuthenticated: req.session.loggedIn ?? false,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      oldInput: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
      },
    });
  } else {
    console.log("req.session.user._id:", req.session.user._id);
    const product = new Product({
      //_id:new mongoose.Types.ObjectId('6548b89441e44463dbcb2e28'),
      title: title,
      price: price,
      description: description,
      imageUrl: imageUrl,
      userId: req.session.user._id,
    });
    await product
      .save()
      .then((response) => {
        console.log(response);
        res.redirect("/admin/products");
      })
      .catch((err) => {
        console.log('An error occured!');
        console.log(err.message);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  }
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  await Product.findById(prodId)
    .then((product) => {
      console.log("productsAdmin:", product);
      if (!product) {
        return res.redirect("/");
      }
      if (product.userId.toString() !== req.session.user._id.toString()) {
        req.flash("errorMessage", "Authorization Error");
        return res.redirect("/admin/products");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        isAuthenticated: req.session.loggedIn ?? false,
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

exports.postEditProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  const product = {
    title: updatedTitle,
    price: updatedPrice,
    description: updatedDesc,
    imageUrl: updatedImageUrl,
  };
  await Product.updateOne({ _id: prodId }, product)
    .then(() => {
      console.log("update successfully.");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log('An error occured!');
      console.log(err.message);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  const message = req.flash("errorMessage");
  console.log("message:", message);

  Product.find({ userId: req.session.user._id })
    .then((response) => {
      res.render("admin/products", {
        prods: response,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isAuthenticated: req.session.loggedIn ?? false,
        errorMessage: message.length > 0 ? message : "",
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

exports.postDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  await Product.findById(prodId)
    .then(async (product) => {
      if (product.userId.toString() !== req.session.user._id.toString()) {
        req.flash("errorMessage", "Authorization Error");
        return res.redirect("/admin/products");
      } else {
        await Product.findByIdAndDelete(prodId)
          .then((response) => {
            console.log("response:", response);
            console.log("Product deleted!!!");
            return res.redirect("/admin/products");
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => {
      console.log('An error occured!');
      console.log(err.message);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
