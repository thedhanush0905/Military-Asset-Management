import express = require("express");
import UserController = require("./user.controller.js");
import userValidator = require("./user.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const userController = new UserController();

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  userValidator.validateCreateUser,
  userController.createUser
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"),
  userValidator.validateListQuery,
  userController.getUsers
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"),
  userController.getUserById
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  userValidator.validateUpdateUser,
  userController.updateUser
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN"),
  userController.updateUserStatus
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  userController.deactivateUser
);

export = router;
