import express = require("express");
import MaintenanceController = require("./maintenance.controller.js");
import maintenanceValidator = require("./maintenance.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const controller = new MaintenanceController();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  maintenanceValidator.validateCreate,
  controller.scheduleMaintenance
);

router.patch(
  "/:id/start",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  maintenanceValidator.validateStart,
  controller.startMaintenance
);

router.patch(
  "/:id/complete",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  maintenanceValidator.validateComplete,
  controller.completeMaintenance
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  maintenanceValidator.validateCancel,
  controller.cancelMaintenance
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  maintenanceValidator.validateListQuery,
  controller.getMaintenances
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  controller.getMaintenanceById
);

export = router;
