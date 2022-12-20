const Product = require("./productModel.js");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { isEmail } = require("validator");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "Enter a username"],
    minlength: [4, "Username must be at least 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Enter a email"],
    validate: [isEmail, "invalid email"],
  },
  password: {
    type: String,
    required: [true, "Enter a password"],
    minlength: [4, "Password must be at least 4 characters"],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  cart: {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const index = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  const updatedCartItems = [...this.cart.items];

  let itemQuantity = 1;
  if (index >= 0) {
    itemQuantity = this.cart.items[index].quantity + 1;
    updatedCartItems[index].quantity = itemQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: itemQuantity,
    });
  }

  this.cart = {
    items: updatedCartItems,
  };
  return this.save();
};

userSchema.methods.deleteCartItem = function (productid) {
  const cartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productid.toString();
  });

  this.cart.items = cartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
