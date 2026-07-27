import express = require("express");
import TransferController = require("./transfer.controller.js");
import transferValidator = require("./transfer.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const controller = new TransferController();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  transferValidator.validateCreateTransfer,
  controller.createTransfer
);

router.patch(
  "/:id/approve",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"),
  controller.approveTransfer
);

router.patch(
  "/:id/reject",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"),
  controller.rejectTransfer
);

router.patch(
  "/:id/dispatch",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  controller.dispatchTransfer
);

router.patch(
  "/:id/receive",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  controller.receiveTransfer
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  controller.cancelTransfer
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  transferValidator.validateListQuery,
  controller.getTransfers
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  controller.getTransferById
);

export = router;
