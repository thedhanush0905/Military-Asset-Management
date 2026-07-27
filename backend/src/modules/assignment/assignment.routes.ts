import express = require("express");
import AssignmentController = require("./assignment.controller.js");
import assignmentValidator = require("./assignment.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const controller = new AssignmentController();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  assignmentValidator.validateCreateAssignment,
  controller.createAssignment
);

router.post(
  "/:id/return",
  authenticate,
  authorize("ADMIN", "LOGISTICS_OFFICER"),
  controller.returnAssignment
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  assignmentValidator.validateListQuery,
  controller.getAssignments
);

router.get(
  "/active",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  assignmentValidator.validateListQuery,
  controller.getActiveAssignments
);

router.get(
  "/history",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  assignmentValidator.validateListQuery,
  controller.getAssignmentHistory
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  controller.getAssignmentById
);

export = router;
