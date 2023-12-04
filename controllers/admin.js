const product = require("../models/product");
const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.session.loggedIn ?? false,
  });
};

exports.postAddProduct = async (req, res, next) => {
  console.log("req.session.user._id:", req.session.user._id);
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
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
      console.log(err);
    });
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
      console.log(err);
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
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  const message = req.flash("errorMessage");
  console.log("message:", message);

  Product.find({userId:req.session.user._id})
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
      console.log(err);
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
      console.log(err);
    });
};
