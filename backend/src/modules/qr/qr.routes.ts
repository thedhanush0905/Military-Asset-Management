import express = require("express");
import QRController = require("./qr.controller.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const controller = new QRController();

router.get(
  "/generate/:assetId",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"),
  controller.generateAssetQR
);

router.post(
  "/scan",
  authenticate,
  controller.resolveScannedQR
);

export = router;
