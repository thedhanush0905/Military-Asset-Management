import express = require("express");
import BaseController = require("./base.controller.js");
import baseValidator = require("./base.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const baseController = new BaseController();

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  baseValidator.validateCreateBase,
  baseController.createBase
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  baseValidator.validateListQuery,
  baseController.getBases
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  baseController.getBaseById
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  baseValidator.validateUpdateBase,
  baseController.updateBase
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  baseController.deleteBase
);

export = router;
