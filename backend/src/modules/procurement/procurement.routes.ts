import express = require("express");
import ProcurementController = require("./procurement.controller.js");
import procurementValidator = require("./procurement.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const controller = new ProcurementController();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  procurementValidator.validateCreate,
  controller.createProcurement
);

router.patch(
  "/:id/approve",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"),
  controller.approveProcurement
);

router.patch(
  "/:id/receive",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  procurementValidator.validateReceive,
  controller.receiveProcurement
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  controller.cancelProcurement
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  procurementValidator.validateListQuery,
  controller.getProcurements
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  controller.getProcurementById
);

export = router;
