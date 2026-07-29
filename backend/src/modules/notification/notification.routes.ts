import express = require("express");
import NotificationController = require("./notification.controller.js");
import notificationValidator = require("./notification.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");

const router = express.Router();
const controller = new NotificationController();

router.get(
  "/",
  authenticate,
  notificationValidator.validateQuery,
  controller.getNotifications
);

router.get(
  "/unread",
  authenticate,
  controller.getUnreadNotifications
);

router.patch(
  "/read-all",
  authenticate,
  controller.markAllAsRead
);

router.patch(
  "/:id/read",
  authenticate,
  controller.markAsRead
);

router.delete(
  "/",
  authenticate,
  controller.deleteAllNotifications
);

router.delete(
  "/:id",
  authenticate,
  controller.deleteNotification
);

export = router;
