exports.get404 = (req, res, next) => {
  res
    .status(404)
    .render("404", {
      pageTitle: "Page Not Found",
      path: "/404",
      isAuthenticated: req.session.loggedIn ?? false,
    });
};

exports.get500 = (req, res, next) => {
  const message = req.flash('errorMessage');
  console.log("message:",message);
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    errorMessage:message,
    isAuthenticated: req.session.loggedIn ?? false,
  });
};
