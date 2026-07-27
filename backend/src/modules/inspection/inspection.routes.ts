import express = require("express");
import InspectionController = require("./inspection.controller.js");
import inspectionValidator = require("./inspection.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const controller = new InspectionController();

router.get(
  "/",
  authenticate,
  inspectionValidator.validateQuery,
  controller.getInspections
);

router.get(
  "/:id",
  authenticate,
  controller.getInspectionById
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"),
  inspectionValidator.validateCreate,
  controller.scheduleInspection
);

router.patch(
  "/:id/complete",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"),
  inspectionValidator.validateUpdate,
  controller.completeInspection
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  controller.deleteInspection
);

export = router;
