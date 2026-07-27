import express = require("express");
import SupplierController = require("./supplier.controller.js");
import supplierValidator = require("./supplier.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const controller = new SupplierController();

router.get(
  "/",
  authenticate,
  supplierValidator.validateQuery,
  controller.getSuppliers
);

router.get(
  "/:id",
  authenticate,
  controller.getSupplierById
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"),
  supplierValidator.validateCreate,
  controller.createSupplier
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"),
  supplierValidator.validateUpdate,
  controller.updateSupplier
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  controller.deleteSupplier
);

export = router;
