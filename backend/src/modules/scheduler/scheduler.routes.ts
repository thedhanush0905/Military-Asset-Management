import express = require("express");
import SchedulerController = require("./scheduler.controller.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const controller = new SchedulerController();

router.get(
  "/jobs",
  authenticate,
  authorize("ADMIN"),
  controller.getJobs
);

router.post(
  "/trigger/:jobName",
  authenticate,
  authorize("ADMIN"),
  controller.triggerJob
);

export = router;
