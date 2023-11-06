const Product = require("../models/product");

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
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId:req.user._id,
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
  Product.find({})
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

exports.postDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  console.log("prodID:", prodId);
  await Product.findByIdAndDelete(prodId)
    .then((response) => {
      console.log("response:", response);
      console.log("Product deleted!!!");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
