import express = require("express");
import DisposalController = require("./disposal.controller.js");
import disposalValidator = require("./disposal.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const controller = new DisposalController();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  disposalValidator.validateCreate,
  controller.createDisposal
);

router.patch(
  "/:id/approve",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"),
  controller.approveDisposal
);

router.patch(
  "/:id/complete",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  disposalValidator.validateComplete,
  controller.completeDisposal
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  disposalValidator.validateCancel,
  controller.cancelDisposal
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  disposalValidator.validateListQuery,
  controller.getDisposals
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  controller.getDisposalById
);

export = router;
