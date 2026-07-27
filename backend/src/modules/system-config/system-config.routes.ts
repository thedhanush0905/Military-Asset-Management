import express = require("express");
import SystemConfigController = require("./system-config.controller.js");
import systemConfigValidator = require("./system-config.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const controller = new SystemConfigController();

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  controller.getAllConfigs
);

router.get(
  "/:key",
  authenticate,
  authorize("ADMIN"),
  controller.getConfig
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  systemConfigValidator.validateUpsert,
  controller.upsertConfig
);

router.delete(
  "/:key",
  authenticate,
  authorize("ADMIN"),
  controller.deleteConfig
);

export = router;
