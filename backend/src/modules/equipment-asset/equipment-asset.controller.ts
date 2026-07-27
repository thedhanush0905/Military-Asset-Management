import express = require("express");
import EquipmentAssetService = require("./equipment-asset.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class EquipmentAssetController {
  private readonly assetService: EquipmentAssetService;

  constructor() {
    this.assetService = new EquipmentAssetService();
  }

  public createAsset = async (
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

      const asset = await this.assetService.createAsset(currentUser, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.CREATED,
        message: "Equipment asset created and inventory synchronized successfully",
        data: { asset },
      });
    } catch (error) {
      next(error);
    }
  };

  public getAssets = async (
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

      const result = await this.assetService.getAssets(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Equipment assets retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getAssetById = async (
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

      const asset = await this.assetService.getAssetById(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Equipment asset retrieved successfully",
        data: { asset },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateAsset = async (
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

      const asset = await this.assetService.updateAsset(currentUser, req.params["id"] as string, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Equipment asset updated and inventory synchronized successfully",
        data: { asset },
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteAsset = async (
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

      const asset = await this.assetService.deleteAsset(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Equipment asset deleted and inventory synchronized successfully",
        data: { asset },
      });
    } catch (error) {
      next(error);
    }
  };
}

export = EquipmentAssetController;
