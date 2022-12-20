const Product = require("../models/productModel.js");
const Category = require("../models/categoryModel.js");
const fs = require("fs");

//get all prdoucts
exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user })
    .populate("userId", "username -_id")
    .select({ description: 0 })
    .sort({ date: -1 })
    .then((products) => {
      res.render("admin/products", {
        title: "Add Products",
        products: products,
        path: "/admin/products",
        action: req.query.action,
      });
    })
    .catch((err) => {
      next(err);
    });
};

// Add product page get products
exports.getAddProduct = (req, res, next) => {
  Category.find()
    .then((categories) => {
      res.render("admin/add-product", {
        title: "Add Product Page",
        path: "/admin/add-product",
        categories: categories,
        inputs: {
          name: "",
          price: "",
          description: "",
        },
      });
    })
    .catch((err) => {
      next(err);
    });
};

// Add product page add products
exports.postAddProduct = (req, res, next) => {
  const name = req.body.name;
  const price = req.body.price;
  const image = req.file;
  const description = req.body.description;
  const ids = req.body.categoryids;

  if (!image) {
    return Category.find().then((categories) => {
      res.render("admin/add-product", {
        title: "Add Product Page",
        path: "/admin/add-product",
        categories: categories,
        errorMessage: "Enter a Image",
        inputs: {
          name: name,
          price: price,
          description,
        },
      });
    });
  }

  const product = new Product({
    name: name,
    price: price,
    imageUrl: image.filename,
    description: description,
    categories: ids,
    userId: req.user,
    isActive: true,
  });
  product
    .save()
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      let message = "";
      if (err.name == "ValidationError") {
        for (field in err.errors) {
          message += err.errors[field].message + "<br>";
        }
        Category.find().then((categories) => {
          res.render("admin/add-product", {
            title: "Add Product Page",
            path: "/admin/add-product",
            categories: categories,
            errorMessage: message,
            inputs: {
              name: name,
              price: price,
              description: description,
            },
          });
        });
      }
      // else {
      //   next(err);
      // }
    });
};

// admin edit product get controller
exports.getEditProduct = (req, res, next) => {
  Product.findOne({ _id: req.params.productid, userId: req.user._id })
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      return product;
    })
    .then((product) => {
      Category.find().then((categories) => {
        categories = categories.map((category) => {
          if (product.categories) {
            product.categories.find((item) => {
              if (item.toString() === category._id.toString()) {
                category.selected = true;
              }
            });
          }
          return category;
        });
        res.render("admin/edit-product", {
          title: "Edit prdoucts",
          path: "/admin/products",
          product: product,
          categories: categories,
        });
      });
    })
    .catch((err) => {
      next(err);
    });
};

// admin edit product post controller
exports.postEditProduct = (req, res, next) => {
  const id = req.body.id;
  const name = req.body.name;
  const price = req.body.price;
  const image = req.file;
  const description = req.body.description;
  const ids = req.body.categoryids;

  Product.findOne({ _id: id, userId: req.user._id })
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      product.name = name;
      product.price = price;
      product.description = description;
      product.categories = ids;

      if (image) {
        fs.unlink("public/img/" + product.imageUrl, (err) => {
          if (err) {
            console.log(err);
          }
        });
        product.imageUrl = image.filename;
      }
      return product.save();
    })
    .then((result) => {
      res.redirect("/admin/products?action=edit");
    })
    .catch((err) => {
      let message = "";
      if (err.name == "ValidationError") {
        for (field in err.errors) {
          message += err.errors[field].message + "<br>";
        }
        Category.find().then((categories) => {
          res.render("admin/edit-product", {
            title: "Edit prdoucts",
            path: "/admin/products",
            categories: categories,
            errorMessage: message,
          });
        });
      } else {
        next(err);
      }
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const id = req.body.productid;
  Product.findOne({ _id: id, userId: req.user._id })
    .then((product) => {
      if (!product) {
        return next(new Error("ürün bulunamadı"));
      }
      fs.unlink("public/img/" + product.imageUrl, (err) => {
        if (err) {
          console.log(err);
        }
      });
      return Product.deleteOne({ _id: id, userId: req.user._id });
    })
    .then((result) => {
      if (result.deletedCount === 0) {
        return res.redirect("/");
      }

      res.redirect("/admin/products?action=delete");
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAddCategory = (req, res, next) => {
  res.render("admin/add-category", {
    title: "New Category",
    path: "/admin/add-category",
  });
};

exports.postAddCategory = (req, res, next) => {
  const name = req.body.name;
  const description = req.body.description;

  const category = new Category({ name: name, description: description });
  category
    .save()
    .then((result) => {
      res.redirect("/admin/categories?action=create");
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCategories = (req, res, next) => {
  Category.find()
    .then((categories) => {
      res.render("admin/categories", {
        title: "Categories",
        path: "/admin/categories",
        categories: categories,
        action: req.query.action,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getEditCategory = (req, res, next) => {
  Category.findById(req.params.categoryid)
    .then((category) => {
      res.render("admin/edit-category", {
        title: "Edit Category",
        path: "/admin/categories",
        category: category,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postEditCategory = (req, res, next) => {
  const id = req.body.id;
  const name = req.body.name;
  const description = req.body.description;

  Category.findById(id)
    .then((category) => {
      category.name = name;
      category.description = description;
      return category.save();
    })
    .then(() => {
      res.redirect("/admin/categories?action=edit");
    })
    .catch((err) => {
      next(err);
    });
};
exports.postDeleteCategory = (req, res, next) => {
  const id = req.body.categoryid;

  Category.findByIdAndRemove(id)
    .then(() => {
      res.redirect("/admin/categories?action=delete");
    })
    .catch((err) => {
      next(err);
    });
};
