const path = require("path");
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
require("dotenv").config();
const errorController = require("./controllers/error");
const MongoDbStore = require("connect-mongodb-session")(session);
const { doubleCsrf } = require("csrf-csrf");
const flash = require("connect-flash");
const User = require("./models/user");
const multer = require("multer");

const app = express();
// const port = 3000;
app.set("view engine", "ejs");
app.set("views", "views");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    console.log("false");
    req.fileError = 'Not valid file';
    cb(null, false);
  }
};

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
//  db.execute('SELECT * FROM products')
//    .then(result => {
//      console.log(result[0], result[1]);
//    })
//    .catch(err => {
//      console.log(err);
//    });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use('/images',express.static(path.join(__dirname, "images")));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

const store = new MongoDbStore({
  uri: process.env.DATABASE,
  collection: "session",
});

app.use(
  session({
    secret: "canakkale17",
    resave: false,
    saveUninitialized: true,
    store: store,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      //console.log("user:", user);
      req.user = user;
      //throw new Error('Dummy Error')
      //console.log("req.user:", req.user);
      next();
    })
    .catch((err) => {
      return next(new Error(err));
    });
});

app.use(flash());
//  const {
//   generateToken, // Use this in your routes to provide a CSRF hash + token cookie and token.
//   doubleCsrfProtection, // This is the default CSRF protection middleware.
// } = doubleCsrf({
//   cookieName: "__Host-psifi.connect-sid",
//   cookieOptions: {
//     secure: true,
//   },
//   getSecret: () => 'supersecret',
//   getTokenFromRequest: req => req.body.csrfToken,
// });
// app.use(doubleCsrfProtection);
// app.use((req,res,next) => {
//   res.locals.csrfToken = generateToken(req,res);
//   next();
// });
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    errorMessage: "Server Error",
    isAuthenticated: true,
  });
});

//app.listen(3000);

mongoose
  .connect(process.env.DATABASE)
  .then((result) => {
    User.findOne()
      .then((user) => {
        if (!user) {
          const user = new User({
            name: "Toprak",
            mail: "toprak@test.com",
            cart: {
              items: [],
            },
          });
          user.save();
        }
      })
      .then((result) => {
        console.log("connected.");
        app.listen(3000);
      })
      .catch((err) => console.log(err));
  })
  .catch((err) => console.log(err));

// app.listen(port,()=>{
//   console.log(`Server ${port} üzerinde çalışmaya başladı`);
// });
