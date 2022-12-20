const express = require("express");
const isAuthenticated = require("../middleware/authentication.js");
const locals = require("../middleware/locals.js");
const router = express.Router();

const shopController = require("../controllers/shopController.js");

router.get("/",locals, shopController.getIndex);

router.get("/products",locals, shopController.getProducts);

router.get("/products/:productid",locals, shopController.getProduct);

router.get("/categories/:categoryid",locals, shopController.getCategoryId);

router.get("/cart", isAuthenticated, locals,shopController.getCart);

router.post("/cart", isAuthenticated,locals, shopController.postCart);

router.post("/delete-cartItem",locals, isAuthenticated,shopController.postDeleteCartItem);

router.get("/orders",isAuthenticated, locals,shopController.getOrders);

router.post("/create-order",isAuthenticated,locals, shopController.postOrder);

module.exports = router;
