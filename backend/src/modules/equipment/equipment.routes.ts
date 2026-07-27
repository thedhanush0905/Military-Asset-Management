import express = require("express");
import EquipmentController = require("./equipment.controller.js");
import equipmentValidator = require("./equipment.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const equipmentController = new EquipmentController();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  equipmentValidator.validateCreateEquipment,
  equipmentController.createEquipment
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  equipmentValidator.validateListQuery,
  equipmentController.getEquipment
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  equipmentController.getEquipmentById
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  equipmentValidator.validateUpdateEquipment,
  equipmentController.updateEquipment
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  equipmentController.deleteEquipment
);

export = router;
