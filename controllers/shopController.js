const Product = require("../models/productModel.js");
const Category = require("../models/categoryModel.js");
const Order = require("../models/orderModel.js");

// get Home Page
exports.getIndex = (req, res, next) => {
  Product.find()
    .sort({ date: -1 })
    .then((products) => {
      return products;
    })
    .then((products) => {
      Category.find().then((categories) => {
        res.render("shop/index", {
          title: "Home Page",
          products: products,
          categories: categories,
          path: "/",
        });
      });
    })
    .catch((err) => {
      next(err);
    });
};

// get all products
exports.getProducts = (req, res, next) => {
  Product.find()
    .sort({ date: -1 })
    .then((products) => {
      return products;
    })
    .then((products) => {
      Category.find().then((categories) => {
        res.render("shop/products", {
          title: "Products",
          products: products,
          categories: categories,
          path: "/products",
        });
      });
    })
    .catch((err) => {
      next(err);
    });
};

// get product By category Id
exports.getCategoryId = (req, res, next) => {
  const categoryid = req.params.categoryid;
  const model = [];
  Category.find()
    .then((categories) => {
      model.categories = categories;
      return Product.find({
        categories: categoryid,
      });
    })
    .then((products) => {
      res.render("shop/products", {
        title: "Products",
        products: products,
        categories: model.categories,
        selectedCategory: categoryid,
        path: "/products",
      });
    })
    .catch((err) => {
      next(err);
    });
};

// get one product for product detail
exports.getProduct = (req, res, next) => {
  Product.findById(req.params.productid)
    .populate("categories", "name")
    .then((product) => {
      res.render("shop/product-detail", {
        title: product.name,
        product: product,
        path: "/products",
      });
    })
    .catch((err) => {
      next(err);
    });
};

// get Cart
exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      res.render("shop/cart", {
        title: "Cart",
        path: "/cart",
        products: user.cart.items,
      });
    })
    .catch((err) => {
      next(err);
    });
};

// Post Cart
exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      next(err);
    });
};

// delete Item from cart
exports.postDeleteCartItem = (req, res, next) => {
  const productid = req.body.productid;

  req.user
    .deleteCartItem(productid)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      next(err);
    });
};

// get orders
exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .sort({ date: -1 })
    .then((orders) => {
      res.render("shop/orders", {
        title: "Orders",
        path: "/orders",
        orders: orders,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const order = new Order({
        user: {
          userId: req.user._id,
          username: req.user.username,
          email: req.user.email,
        },
        items: user.cart.items.map((p) => {
          return {
            product: {
              _id: p.productId._id,
              name: p.productId.name,
              price: p.productId.price,
              imageUrl: p.productId.imageUrl,
            },
            quantity: p.quantity,
          };
        }),
      });
      order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      next(err);
    });
};
