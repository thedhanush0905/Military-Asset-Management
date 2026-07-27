import express = require("express");
import InventoryController = require("./inventory.controller.js");
import inventoryValidator = require("./inventory.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const controller = new InventoryController();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  inventoryValidator.validateListQuery,
  controller.getInventories
);

router.get(
  "/low-stock",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  inventoryValidator.validateListQuery,
  controller.getLowStockInventory
);

router.get(
  "/base/:baseId",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  inventoryValidator.validateListQuery,
  controller.getInventoryByBaseId
);

router.get(
  "/equipment/:equipmentId",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  inventoryValidator.validateListQuery,
  controller.getInventoryByEquipmentId
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  controller.getInventoryById
);

export = router;
