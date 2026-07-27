import express = require("express");
import ReportService = require("./report.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class ReportController {
  private readonly reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  public requestReport = async (
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

      const { reportType, exportFormat, filters } = req.body;
      const jobResult = await this.reportService.requestReport(
        currentUser,
        reportType,
        exportFormat,
        filters
      );

      // Return 202 Accepted for long running async jobs
      apiResponse.successResponse({
        res,
        statusCode: 202,
        message: "Report generation job started successfully",
        data: jobResult,
      });
    } catch (error) {
      next(error);
    }
  };

  public getReportJobStatus = async (
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

      const job = await this.reportService.getReportJobStatus(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Report job status loaded successfully",
        data: job,
      });
    } catch (error) {
      next(error);
    }
  };

  public downloadReport = async (
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

      const { filename, mimeType, buffer } = await this.reportService.downloadReport(
        currentUser,
        req.params["id"] as string
      );

      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", mimeType);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };
}

export = ReportController;
