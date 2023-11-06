const path = require("path");
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const errorController = require("./controllers/error");

const User = require("./models/user");

const app = express();
// const port = 3000;
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

//  db.execute('SELECT * FROM products')
//    .then(result => {
//      console.log(result[0], result[1]);
//    })
//    .catch(err => {
//      console.log(err);
//    });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("6548b7e2a4aeb03d3d9dc642")
    .then((user) => {
      console.log("user:", user);
      req.user = user;
      console.log("req.user:", req.user);
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

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
