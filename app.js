const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const mongoConnect = require('./util/database');

const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.set("views", "views");

// const adminRoutes = require("./routes/admin");
// const shopRoutes = require("./routes/shop");

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
  // User.findByPk(1)
  //   .then((user) => {
  //     req.user = user;
  //     next();
  //   })
  //   .catch((err) => console.log(err));
});

// app.use("/admin", adminRoutes);
// app.use(shopRoutes);

app.use(errorController.get404);

//app.listen(3000);

mongoConnect((client) => {
  console.log(client);
  app.listen(3000);
});

// app.listen(port,()=>{
//   console.log(`Server ${port} üzerinde çalışmaya başladı`);
// });
