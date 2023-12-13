const User = require("./../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
require("dotenv").config();
const sgMail = require("@sendgrid/mail");
const { uploadFile } = require("./../util/s3");
const { validationResult } = require("express-validator");

sgMail.setApiKey(process.env.SEND_MAIL);

exports.getLogin = (req, res, next) => {
  const message = req.flash("errorMessage");
  console.log("message:", message);

  const loggedIn = req.session.loggedIn;
  console.log("loggedIn:", loggedIn);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: loggedIn,
    errorMessage: message.length > 0 ? message : "",
    oldInput: { email: '', password: '' },
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  const loggedIn = req.session.loggedIn;
  console.log("errors:", errors.array());
  if (!errors.isEmpty()) {
    res.render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      isAuthenticated: loggedIn,
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password },
    });
  }
  //req.isLoggedIn = true;
  //Cookie set
  //res.setHeader('Set-Cookie','loggedIn=true; Max-Age=10')
  else {
    User.findOne({ mail: req.body.email })
      .then((user) => {
        console.log("user17:", user);
        if (user) {
          bcrypt
            .compare(req.body.password, user.password)
            .then((isCompare) => {
              if (isCompare == true) {
                req.session.user = user;
                req.session.loggedIn = true;
                req.session.save((err) => {
                  console.log(err);
                  return res.redirect("/");
                });
              } else {
                req.flash("errorMessage", "Invalid email or password");
                return res.redirect("/login");
              }
            })
            .catch((hash_err) => {
              console.log(hash_err);
            });
        }
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

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log("geldi");
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
    errorMessage: "",
    validationErrors:[]
  });
};

exports.postSignup = (req, res, next) => {
  const errors = validationResult(req);
  console.log("errors:", errors.array());
  if (!errors.isEmpty()) {
    res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      validationErrors:errors.array()
    });
  } else {
    const email = req.body.email;
    console.log("email:", email);
    const password = req.body.password;
    User.findOne({ mail: email })
      .then((user) => {
        if (user) {
          return res.redirect("/signup");
        }
        bcrypt
          .hash(password, 12)
          .then((hashPassword) => {
            return User.create({
              mail: email,
              password: hashPassword,
              cart: {
                items: [],
              },
            });
          })
          .then((_result) => {
            const msg = {
              to: email, // Change to your recipient
              from: "toprak1771@gmail.com", // Change to your verified sender
              subject: "Sending with SendGrid is Fun",
              text: "and easy to do anywhere, even with Node.js",
              html: "<strong>and easy to do anywhere, even with Node.js</strong>",
            };
            sgMail
              .send(msg)
              .then(() => {
                console.log("Email sent");
                uploadFile(email);
                return res.redirect("/login");
              })
              .catch((error) => {
                console.log(error);
              });
          })
          .catch((hash_err) => {
            console.log(hash_err);
          });
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

exports.getReset = (req, res, next) => {
  const message = req.flash("errorMessage");
  console.log("message:", message);

  const loggedIn = req.session.loggedIn;
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset",
    isAuthenticated: loggedIn,
    errorMessage: message.length > 0 ? message : "",
  });
};

exports.postReset = async (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ mail: req.body.email })
      .then(async (user) => {
        if (!user) {
          req.flash("errorMessage", "No account with that email found.");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return await user.save();
      })
      .then((result) => {
        res.redirect("/");
        //console.log("result:",result);
        const msg = {
          to: req.body.email, // Change to your recipient
          from: "toprak1771@gmail.com", // Change to your verified sender
          subject: "Password reset",
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
          `,
        };
        sgMail
          .send(msg)
          .then(() => {
            console.log("Email sent");
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((err) => {
        console.log('An error occured!');
        console.log(err.message);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const message = req.flash("errorMessage");
  const loggedIn = req.session.loggedIn;

  const token = req.params.token;
  if (!token) {
    req.flash("errorMessage", "Token is not found!");
    res.redirect("/login");
  }
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      console.log("user:", user);
      res.render("auth/newPassword", {
        path: "/newPassword",
        pageTitle: "New Password",
        isAuthenticated: loggedIn,
        errorMessage: message.length > 0 ? message : "",
        resetToken: token,
        email: user.mail,
        id: user._id,
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

exports.postNewPassword = (req, res, next) => {
  let _user;
  User.findById(req.body.id)
    .then((user) => {
      if (!user) {
        req.flash("errorMessage", "User is not found!");
        res.redirect("/login");
      }
      _user = user;
      bcrypt
        .hash(req.body.password, 12)
        .then((hashPassword) => {
          _user.password = hashPassword;
          _user.resetToken = undefined;
          _user.resetTokenExpiration = undefined;
          return _user.save();
        })
        .then((result) => {
          console.log("password updated");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
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
