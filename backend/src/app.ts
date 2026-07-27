import express = require("express");
import helmet = require("helmet");
import cors = require("cors");
import morgan = require("morgan");
import swaggerUi = require("swagger-ui-express");
import openapiSpec = require("./shared/docs/openapi.json");
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
import maintenanceRoutes = require("./modules/maintenance/maintenance.routes.js");
import procurementRoutes = require("./modules/procurement/procurement.routes.js");
import disposalRoutes = require("./modules/disposal/disposal.routes.js");
import dashboardRoutes = require("./modules/dashboard/dashboard.routes.js");
import auditLogRoutes = require("./modules/audit-log/audit-log.routes.js");
import notificationRoutes = require("./modules/notification/notification.routes.js");
import systemConfigRoutes = require("./modules/system-config/system-config.routes.js");
import supplierRoutes = require("./modules/supplier/supplier.routes.js");
import personnelRoutes = require("./modules/personnel/personnel.routes.js");
import organizationUnitRoutes = require("./modules/organization-unit/organization-unit.routes.js");
import attachmentRoutes = require("./modules/attachment/attachment.routes.js");
import warrantyRoutes = require("./modules/warranty/warranty.routes.js");
import inspectionRoutes = require("./modules/inspection/inspection.routes.js");
import depreciationRoutes = require("./modules/depreciation/depreciation.routes.js");
import qrRoutes = require("./modules/qr/qr.routes.js");
import schedulerRoutes = require("./modules/scheduler/scheduler.routes.js");
import searchRoutes = require("./modules/search/search.routes.js");
import reportRoutes = require("./modules/report/report.routes.js");

const app = express();

app.use(helmet.default());
app.use(cors());

const morganFormat = process.env["NODE_ENV"] === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

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
app.use("/maintenance", maintenanceRoutes);
app.use("/procurements", procurementRoutes);
app.use("/disposals", disposalRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/audit-logs", auditLogRoutes);
app.use("/notifications", notificationRoutes);
app.use("/system-configs", systemConfigRoutes);
app.use("/suppliers", supplierRoutes);
app.use("/personnel", personnelRoutes);
app.use("/org-units", organizationUnitRoutes);
app.use("/attachments", attachmentRoutes);
app.use("/warranties", warrantyRoutes);
app.use("/inspections", inspectionRoutes);
app.use("/depreciation", depreciationRoutes);
app.use("/qr", qrRoutes);
app.use("/scheduler", schedulerRoutes);
app.use("/search", searchRoutes);
app.use("/reports", reportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export = app;
