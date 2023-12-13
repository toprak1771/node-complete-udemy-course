const path = require("path");

const express = require("express");
const { query, body, check } = require("express-validator");
const adminController = require("../controllers/admin");
const isAuth = require('./../middleware/isAuth');

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth,adminController.getAddProduct);

// // /admin/products => GET
router.get("/products",isAuth,adminController.getProducts);

// // /admin/add-product => POST
router.post("/add-product",isAuth,body('title').isString().isLength({min:3}).withMessage('Please enter valid product title'),adminController.postAddProduct);

router.get("/edit-product/:productId",isAuth, adminController.getEditProduct);

router.post("/edit-product",isAuth, adminController.postEditProduct);

router.post("/delete-product",isAuth, adminController.postDeleteProduct);

module.exports = router;
