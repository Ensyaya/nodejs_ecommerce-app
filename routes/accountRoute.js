const express = require("express");

const router = express.Router();
const locals = require("../middleware/locals.js");

const accountController = require("../controllers/accountController.js");

router.get("/login", locals, accountController.getLogin);
router.post("/login",locals, accountController.postLogin);

router.get("/register", locals, accountController.getRegister);
router.post("/register",locals, accountController.postRegister);

router.get("/logout",locals, accountController.getLogout);


module.exports = router;
