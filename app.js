const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const errorController = require("./controllers/error");
const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

const app = express();
const port = 3000;
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
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

//app.listen(3000);

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
User.hasMany(Order);
Order.belongsTo(User);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: "CartItem" });
Product.belongsToMany(Cart, { through: "CartItem" });
Order.belongsToMany(Product, { through: "OrderItem" });

sequelize
  .sync()
  //.sync({ force: true })
  .then(() => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      User.create({ userName: "Toprak", mail: "toprak@test.com" });
    }
    return user;
  })
  // .then((user) => {
  //   console.log("user:", user);
  //   return user.createCart();
  // })
  .then((user) => {
    app.listen(port, () => {
      console.log(`Server ${port} üzerinde çalışmaya başladı`);
    });
  })
  .catch((error) => {
    console.error("Unable to create table : ", error);
  });

// app.listen(port,()=>{
//   console.log(`Server ${port} üzerinde çalışmaya başladı`);
// });
