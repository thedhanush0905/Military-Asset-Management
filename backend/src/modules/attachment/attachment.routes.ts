import express = require("express");
import multer = require("multer");
import AttachmentController = require("./attachment.controller.js");
import attachmentValidator = require("./attachment.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");

const router = express.Router();
const controller = new AttachmentController();

// Multer memory configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB file size limit
});

router.post(
  "/",
  authenticate,
  upload.single("file"),
  attachmentValidator.validateUpload,
  controller.uploadAttachment
);

router.get(
  "/:id/download",
  authenticate,
  controller.downloadAttachment
);

router.get(
  "/entity/:entityType/:entityId",
  authenticate,
  controller.getEntityAttachments
);

router.delete(
  "/:id",
  authenticate,
  controller.deleteAttachment
);

export = router;
