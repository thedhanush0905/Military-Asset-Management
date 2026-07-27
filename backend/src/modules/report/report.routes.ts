import express = require("express");
import ReportController = require("./report.controller.js");
import reportValidator = require("./report.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");

const router = express.Router();
const controller = new ReportController();

router.post(
  "/",
  authenticate,
  reportValidator.validateRequest,
  controller.requestReport
);

router.get(
  "/jobs/:id",
  authenticate,
  controller.getReportJobStatus
);

router.get(
  "/download/:id",
  authenticate,
  controller.downloadReport
);

export = router;
