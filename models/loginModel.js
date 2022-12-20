const mongoose = require("mongoose");
const { isEmail } = require("validator");

const loginSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, "Enter a email"],
    validate: [isEmail, "invalid email"],
  },
  password: {
    type: String,
    required: [true, "Enter a password"],
  },
});

module.exports = mongoose.model("Login", loginSchema);
