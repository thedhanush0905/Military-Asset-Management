import express = require("express");
import OrganizationUnitController = require("./organization-unit.controller.js");
import organizationUnitValidator = require("./organization-unit.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const controller = new OrganizationUnitController();

router.get(
  "/tree",
  authenticate,
  controller.getUnitsTree
);

router.get(
  "/:id",
  authenticate,
  controller.getUnitById
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  organizationUnitValidator.validateCreate,
  controller.createUnit
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  organizationUnitValidator.validateUpdate,
  controller.updateUnit
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  controller.deleteUnit
);

export = router;
