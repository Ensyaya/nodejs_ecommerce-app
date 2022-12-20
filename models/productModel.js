const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Enter a product name"],
    minlength: [5, "Product name must be at least 5 characters"],
    maxlength: 255,
    trim: true,
  },
  price: {
    type: Number,
    required: [
      function () {
        return this.isActive;
      },
      "Enter a product price",
    ],
    min: [1, "Product price must be bigger than 0"],
  },
  imageUrl: String,
  description: {
    type: String,
    minlength: [4, "Product description must be at least 5 characters"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Select a product category"],
    },
  ],

  isActive: Boolean,
});

module.exports = mongoose.model("Product", productSchema);
