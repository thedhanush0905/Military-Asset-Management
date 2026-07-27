import express = require("express");
import MaintenanceService = require("./maintenance.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class MaintenanceController {
  private readonly maintenanceService: MaintenanceService;

  constructor() {
    this.maintenanceService = new MaintenanceService();
  }

  public scheduleMaintenance = async (
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

      const maintenance = await this.maintenanceService.scheduleMaintenance(currentUser, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.CREATED,
        message: "Maintenance scheduled successfully",
        data: { maintenance },
      });
    } catch (error) {
      next(error);
    }
  };

  public startMaintenance = async (
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

      const maintenance = await this.maintenanceService.startMaintenance(
        currentUser,
        req.params["id"] as string,
        req.body
      );
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Maintenance workflow started and asset status transitioned successfully",
        data: { maintenance },
      });
    } catch (error) {
      next(error);
    }
  };

  public completeMaintenance = async (
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

      const maintenance = await this.maintenanceService.completeMaintenance(
        currentUser,
        req.params["id"] as string,
        req.body
      );
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Maintenance completed and asset returned to service successfully",
        data: { maintenance },
      });
    } catch (error) {
      next(error);
    }
  };

  public cancelMaintenance = async (
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

      const maintenance = await this.maintenanceService.cancelMaintenance(
        currentUser,
        req.params["id"] as string,
        req.body
      );
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Scheduled maintenance cancelled successfully",
        data: { maintenance },
      });
    } catch (error) {
      next(error);
    }
  };

  public getMaintenanceById = async (
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

      const maintenance = await this.maintenanceService.getMaintenanceById(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Maintenance record retrieved successfully",
        data: { maintenance },
      });
    } catch (error) {
      next(error);
    }
  };

  public getMaintenances = async (
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

      const result = await this.maintenanceService.getMaintenances(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Maintenance records retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export = MaintenanceController;
