const express = require("express");

const router = express.Router();

const errorsController = require("../controllers/errorsController.js");

router.get("/500", errorsController.get500Page);
router.get("*", errorsController.get404Page);

module.exports = router;
