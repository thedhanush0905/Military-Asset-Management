import express = require("express");
import ProcurementService = require("./procurement.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class ProcurementController {
  private readonly procurementService: ProcurementService;

  constructor() {
    this.procurementService = new ProcurementService();
  }

  public createProcurement = async (
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

      const procurement = await this.procurementService.createProcurement(currentUser, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.CREATED,
        message: "Procurement record created successfully in DRAFT",
        data: { procurement },
      });
    } catch (error) {
      next(error);
    }
  };

  public approveProcurement = async (
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

      const procurement = await this.procurementService.approveProcurement(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Procurement record approved successfully",
        data: { procurement },
      });
    } catch (error) {
      next(error);
    }
  };

  public receiveProcurement = async (
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

      const procurement = await this.procurementService.receiveProcurement(
        currentUser,
        req.params["id"] as string,
        req.body
      );
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Procurement items received, assets created and inventory aggregates synced successfully",
        data: { procurement },
      });
    } catch (error) {
      next(error);
    }
  };

  public cancelProcurement = async (
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

      const procurement = await this.procurementService.cancelProcurement(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Procurement order cancelled successfully",
        data: { procurement },
      });
    } catch (error) {
      next(error);
    }
  };

  public getProcurementById = async (
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

      const procurement = await this.procurementService.getProcurementById(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Procurement record retrieved successfully",
        data: { procurement },
      });
    } catch (error) {
      next(error);
    }
  };

  public getProcurements = async (
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

      const result = await this.procurementService.getProcurements(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Procurement orders retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export = ProcurementController;
