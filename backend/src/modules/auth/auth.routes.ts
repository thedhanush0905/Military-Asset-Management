import express = require("express");
import AuthController = require("./auth.controller.js");
import authValidator = require("./auth.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");

const router = express.Router();
const authController = new AuthController();

router.post("/login", authValidator.validateLogin, authController.login);
router.get("/me", authenticate, authController.me);

export = router;
