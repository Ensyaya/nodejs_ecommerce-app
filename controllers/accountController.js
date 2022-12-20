const User = require("../models/userModel");
const Login = require("../models/loginModel");
const bcrypt = require("bcrypt");

exports.getLogin = (req, res, next) => {
  let errorMessage = req.session.errorMessage;
  delete req.session.errorMessage;
  res.render("account/login", {
    path: "/login",
    title: "Login",
    errorMessage: errorMessage,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const loginModel = new Login({
    email: email,
    password: password,
  });

  loginModel
    .validate()
    .then(() => {
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            req.session.errorMessage = "No such email address was found.";
            req.session.save(function (err) {
              return res.redirect("/login");
            });
          }
          bcrypt
            .compare(password, user.password)
            .then((isSuccess) => {
              if (isSuccess) {
                req.session.user = user;
                req.session.isAuthenticated = true;
                return req.session.save(function (err) {
                  let url = req.session.redirectTo || "/";
                  delete req.session.redirectTo;
                  return res.redirect(url);
                });
              }
              req.session.errorMessage = "wrong email or password.";
              req.session.save(function (err) {
                return res.redirect("/login");
              });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      let message = "";
      if (err.name == "ValidationError") {
        for (field in err.errors) {
          message += err.errors[field].message + "<br>";
        }
        res.render("account/login", {
          path: "/login",
          title: "Login",
          errorMessage: message,
        });
      } else {
        next(err);
      }
    });
};

exports.getRegister = (req, res, next) => {
  let errorMessage = req.session.errorMessage;
  delete req.session.errorMessage;
  res.render("account/register", {
    path: "/register",
    title: "Register",
    errorMessage: errorMessage,
  });
};

exports.postRegister = (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  if (password == "") {
    req.session.errorMessage = "Enter a password ";
    req.session.save(function (err) {
      return res.redirect("/register");
    });
  } else {
    User.findOne({ email: email })
      .then((user) => {
        if (user) {
          req.session.errorMessage = "This email address already exist";
          req.session.save(function () {
            return res.redirect("/register");
          });
        }
        return bcrypt.hash(password, 10);
      })
      .then((hashedPassword) => {
        const newUser = new User({
          username: username,
          email: email,
          password: hashedPassword,
          cart: { items: [] },
        });
        return newUser.save();
      })
      .then(() => {
        res.redirect("/login");
      })
      .catch((err) => {
        let message = "";
        if (err.name == "ValidationError") {
          for (field in err.errors) {
            message += err.errors[field].message + "<br>";
          }
          res.render("account/register", {
            path: "/register",
            title: "Register",
            errorMessage: message,
          });
        } else {
          next(err);
        }
      });
  }
};

exports.getLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
