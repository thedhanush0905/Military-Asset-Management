import express = require("express");
import DashboardController = require("./dashboard.controller.js");
import dashboardValidator = require("./dashboard.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const controller = new DashboardController();

router.get(
  "/overview",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  dashboardValidator.validateQuery,
  controller.getOverview
);

router.get(
  "/base-summary",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  dashboardValidator.validateQuery,
  controller.getBaseSummary
);

router.get(
  "/equipment-summary",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  dashboardValidator.validateQuery,
  controller.getEquipmentSummary
);

router.get(
  "/procurement-summary",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"), // Block LOGISTICS_OFFICER at route level as well
  dashboardValidator.validateQuery,
  controller.getProcurementSummary
);

router.get(
  "/maintenance-summary",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  dashboardValidator.validateQuery,
  controller.getMaintenanceSummary
);

router.get(
  "/disposal-summary",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  dashboardValidator.validateQuery,
  controller.getDisposalSummary
);

router.get(
  "/transfer-summary",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  dashboardValidator.validateQuery,
  controller.getTransferSummary
);

router.get(
  "/recent-activities",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  dashboardValidator.validateQuery,
  controller.getRecentActivities
);

router.get(
  "/top-lists",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  dashboardValidator.validateQuery,
  controller.getTopLists
);

export = router;
