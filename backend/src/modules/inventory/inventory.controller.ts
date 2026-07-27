import express = require("express");
import InventoryService = require("./inventory.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class InventoryController {
  private readonly inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  public getInventories = async (
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

      const result = await this.inventoryService.getInventories(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Inventories retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getInventoryById = async (
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

      const inventory = await this.inventoryService.getInventoryById(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Inventory retrieved successfully",
        data: { inventory },
      });
    } catch (error) {
      next(error);
    }
  };

  public getInventoryByBaseId = async (
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

      const result = await this.inventoryService.getInventoryByBaseId(
        currentUser,
        req.params["baseId"] as string,
        req.query
      );
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Base inventories retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getInventoryByEquipmentId = async (
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

      const result = await this.inventoryService.getInventoryByEquipmentId(
        currentUser,
        req.params["equipmentId"] as string,
        req.query
      );
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Equipment inventories retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getLowStockInventory = async (
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

      const result = await this.inventoryService.getLowStockInventory(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Low stock inventories retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export = InventoryController;
