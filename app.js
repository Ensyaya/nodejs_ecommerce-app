const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csurf = require("csurf");
const multer = require("multer");

const adminRoutes = require("./routes/adminRoute.js");
const shopRoutes = require("./routes/shopRoute.js");
const accountRoutes = require("./routes/accountRoute.js");
const errorRoutes = require("./routes/errorRoute.js");

const User = require("./models/userModel.js");
const ConnectionString =
  "mongodb+srv://admin:bdeecff55@cluster0.odmyhax.mongodb.net/node-app?retryWrites=true&w=majority";

const app = express();

app.set("view engine", "pug");
app.set("views", "./views");

let store = new MongoDBStore({
  uri: ConnectionString,
  collection: "mySessions",
});
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/img");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ storage: storage }).single("imageUrl"));
app.use(cookieParser());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 },
    store: store,
  })
);
app.use(express.static(path.join(__dirname, "public")));

//middleware
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});
app.use(csurf());

//routes
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(accountRoutes);
app.use(errorRoutes);
app.use((error, req, res, next) => {
  res.status(500).render("errors/500", { title: "error" });
});

//db config

mongoose
  .connect(ConnectionString)
  .then(() => {
    console.log("connected to mongodb");
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
