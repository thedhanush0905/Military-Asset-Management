import express = require("express");
import EquipmentAssetController = require("./equipment-asset.controller.js");
import equipmentAssetValidator = require("./equipment-asset.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const controller = new EquipmentAssetController();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  equipmentAssetValidator.validateCreateAsset,
  controller.createAsset
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  equipmentAssetValidator.validateListQuery,
  controller.getAssets
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  controller.getAssetById
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  equipmentAssetValidator.validateUpdateAsset,
  controller.updateAsset
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  controller.deleteAsset
);

export = router;
