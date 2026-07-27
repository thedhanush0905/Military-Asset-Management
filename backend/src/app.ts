import express = require("express");
import helmet = require("helmet");
import cors = require("cors");
import morgan = require("morgan");
import notFoundHandler = require("./middleware/notFound.middleware.js");
import errorHandler = require("./middleware/error.middleware.js");
import apiResponse = require("./shared/responses/apiResponse.js");
import HttpStatus = require("./constants/httpStatus.js");
import Messages = require("./constants/messages.js");
import authRoutes = require("./modules/auth/auth.routes.js");
import userRoutes = require("./modules/user/user.routes.js");
import baseRoutes = require("./modules/base/base.routes.js");
import equipmentRoutes = require("./modules/equipment/equipment.routes.js");
import equipmentAssetRoutes = require("./modules/equipment-asset/equipment-asset.routes.js");
import inventoryRoutes = require("./modules/inventory/inventory.routes.js");
import assignmentRoutes = require("./modules/assignment/assignment.routes.js");
import transferRoutes = require("./modules/transfer/transfer.routes.js");
import movementRoutes = require("./modules/movement/movement.routes.js");

const app = express();

app.use(helmet.default());
app.use(cors());

const morganFormat = process.env["NODE_ENV"] === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  apiResponse.successResponse({
    res,
    statusCode: HttpStatus.OK,
    message: Messages.SERVER_RUNNING,
  });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/bases", baseRoutes);
app.use("/equipment", equipmentRoutes);
app.use("/equipment-assets", equipmentAssetRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/transfers", transferRoutes);
app.use("/movements", movementRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export = app;
