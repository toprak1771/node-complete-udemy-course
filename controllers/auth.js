const User = require("./../models/user");

exports.getLogin = (req, res, next) => {
  //console.log("cookie:",req.get('Cookie')?.trim().split('=')[1])
  //const loggedIn = req.get('Cookie')?.trim().split('=')[1];
  const loggedIn = req.session.loggedIn;
  console.log("loggedIn:", loggedIn);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: loggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  //req.isLoggedIn = true;
  //Cookie set
  //res.setHeader('Set-Cookie','loggedIn=true; Max-Age=10')
  User.findById("6548b7e2a4aeb03d3d9dc642")
    .then((user) => {
      console.log("user:", user);
      if (user) {
        req.session.user = user;
        req.session.loggedIn = true;
      }
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};
