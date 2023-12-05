const express = require("express");
const authController = require("./../controllers/auth");
const router = express.Router();
const { query, body, check } = require("express-validator");
const User = require("./../models/user");

router.get("/login", authController.getLogin);

router.post(
  "/login",
  body("email").isEmail().withMessage("Please enter a valid email."),
  body("password")
    .isLength({ min: 5 })
    .withMessage(
      "Please enter password with only numbers and a least 5 characters"
    )
    .isAlphanumeric(),
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom(async (value, { req }) => {
      let _user;
      await User.find({ mail: value }).then((user) => {
        console.log("user:", user);
        _user = user;
      });
      if (_user && _user.length > 0) {
        throw new Error("This email is already exist.");
      }
      return true;
    }),
  body("password")
    .isLength({ min: 5 })
    .withMessage(
      "Please enter password with only numbers and a least 5 characters"
    )
    .isAlphanumeric(),
  body("confirmPassword").custom((value, { req }) => {
    if (req.body.password !== value) {
      throw new Error("This is not equal comfirm password and pasword");
    }
    return true;
  }),
  authController.postSignup
);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/newPassword", authController.postNewPassword);

module.exports = router;
