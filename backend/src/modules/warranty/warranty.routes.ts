import express = require("express");
import WarrantyController = require("./warranty.controller.js");
import warrantyValidator = require("./warranty.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const controller = new WarrantyController();

router.get(
  "/",
  authenticate,
  warrantyValidator.validateQuery,
  controller.getWarranties
);

router.get(
  "/:id",
  authenticate,
  controller.getWarrantyById
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"),
  warrantyValidator.validateCreate,
  controller.createWarranty
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"),
  warrantyValidator.validateUpdate,
  controller.updateWarranty
);

export = router;
