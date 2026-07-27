import express = require("express");
import PersonnelController = require("./personnel.controller.js");
import personnelValidator = require("./personnel.validator.js");
import authenticate = require("../../middleware/auth.middleware.js");
import authorize = require("../../middleware/rbac.middleware.js");

const router = express.Router();
const controller = new PersonnelController();

router.get(
  "/",
  authenticate,
  personnelValidator.validateQuery,
  controller.getPersonnelList
);

router.get(
  "/:id",
  authenticate,
  controller.getPersonnelById
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"),
  personnelValidator.validateCreate,
  controller.createPersonnel
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "BASE_COMMANDER"),
  personnelValidator.validateUpdate,
  controller.updatePersonnel
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  controller.deletePersonnel
);

export = router;
