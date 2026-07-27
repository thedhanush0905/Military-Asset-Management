import express = require("express");
import WarrantyService = require("./warranty.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class WarrantyController {
  private readonly warrantyService: WarrantyService;

  constructor() {
    this.warrantyService = new WarrantyService();
  }

  public createWarranty = async (
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

      const warranty = await this.warrantyService.createWarranty(currentUser, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.CREATED,
        message: "Warranty record registered successfully",
        data: warranty,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateWarranty = async (
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

      const warranty = await this.warrantyService.updateWarranty(currentUser, req.params["id"] as string, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Warranty record updated successfully",
        data: warranty,
      });
    } catch (error) {
      next(error);
    }
  };

  public getWarrantyById = async (
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

      const warranty = await this.warrantyService.getWarrantyById(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Warranty details loaded successfully",
        data: warranty,
      });
    } catch (error) {
      next(error);
    }
  };

  public getWarranties = async (
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

      const result = await this.warrantyService.getWarranties(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Warranties list loaded successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export = WarrantyController;
