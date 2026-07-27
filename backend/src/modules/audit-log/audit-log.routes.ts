import express = require("express");
import AuditLogController = require("./audit-log.controller.js");
import auditLogValidator = require("./audit-log.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const controller = new AuditLogController();

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  auditLogValidator.validateQuery,
  controller.getAuditLogs
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  controller.getAuditLogById
);

export = router;
