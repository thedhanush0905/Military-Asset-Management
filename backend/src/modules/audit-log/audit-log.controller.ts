import express = require("express");
import AuditLogService = require("./audit-log.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class AuditLogController {
  private readonly auditLogService: AuditLogService;

  constructor() {
    this.auditLogService = new AuditLogService();
  }

  public getAuditLogs = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: "Unauthorized" });
        return;
      }

      const logs = await this.auditLogService.getAuditLogs(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Audit logs retrieved successfully",
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  };

  public getAuditLogById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: "Unauthorized" });
        return;
      }

      const log = await this.auditLogService.getAuditLogById(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Audit log retrieved successfully",
        data: log,
      });
    } catch (error) {
      next(error);
    }
  };
}

export = AuditLogController;
