import express = require("express");
import GlobalSearchController = require("./search.controller.js");
import searchValidator = require("./search.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");

const router = express.Router();
const controller = new GlobalSearchController();

router.get(
  "/",
  authenticate,
  searchValidator.validateSearch,
  controller.search
);

export = router;
