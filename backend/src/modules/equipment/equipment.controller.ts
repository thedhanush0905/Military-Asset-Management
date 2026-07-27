import express = require("express");
import EquipmentService = require("./equipment.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class EquipmentController {
  private readonly equipmentService: EquipmentService;

  constructor() {
    this.equipmentService = new EquipmentService();
  }

  public createEquipment = async (
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

      const equipment = await this.equipmentService.createEquipment(currentUser, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.CREATED,
        message: "Equipment model created successfully",
        data: { equipment },
      });
    } catch (error) {
      next(error);
    }
  };

  public getEquipment = async (
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

      const result = await this.equipmentService.getEquipment(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Equipment models retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getEquipmentById = async (
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

      const equipment = await this.equipmentService.getEquipmentById(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Equipment model retrieved successfully",
        data: { equipment },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateEquipment = async (
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

      const equipment = await this.equipmentService.updateEquipment(currentUser, req.params["id"] as string, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Equipment model updated successfully",
        data: { equipment },
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteEquipment = async (
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

      const equipment = await this.equipmentService.deleteEquipment(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Equipment model deleted successfully",
        data: { equipment },
      });
    } catch (error) {
      next(error);
    }
  };
}

export = EquipmentController;
