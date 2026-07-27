import express = require("express");
import DepreciationController = require("./depreciation.controller.js");
import depreciationValidator = require("./depreciation.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const controller = new DepreciationController();

router.get(
  "/",
  authenticate,
  controller.getValuations
);

router.get(
  "/:id/history",
  authenticate,
  controller.getAssetValuationHistory
);

router.post(
  "/setup",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"),
  depreciationValidator.validateSetup,
  controller.setupValuation
);

router.post(
  "/:id/calculate",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"),
  depreciationValidator.validateCalculateQuery,
  controller.calculateAssetDepreciation
);

export = router;
