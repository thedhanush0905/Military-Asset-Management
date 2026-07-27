import express = require("express");
import DepreciationService = require("./depreciation.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class DepreciationController {
  private readonly depreciationService: DepreciationService;

  constructor() {
    this.depreciationService = new DepreciationService();
  }

  public setupValuation = async (
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

      const valuation = await this.depreciationService.setupValuation(currentUser, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.CREATED,
        message: "Asset valuation params configured successfully",
        data: valuation,
      });
    } catch (error) {
      next(error);
    }
  };

  public calculateAssetDepreciation = async (
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

      const targetDate = (req.query["targetDate"] as any) || new Date();
      const updatedValuation = await this.depreciationService.calculateAssetDepreciation(
        currentUser,
        req.params["id"] as string,
        targetDate
      );

      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Asset depreciation calculated successfully",
        data: updatedValuation,
      });
    } catch (error) {
      next(error);
    }
  };

  public getValuations = async (
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

      const result = await this.depreciationService.getValuations(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Valuations loaded successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getAssetValuationHistory = async (
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

      const history = await this.depreciationService.getAssetValuationHistory(
        currentUser,
        req.params["id"] as string
      );

      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Asset valuation history loaded successfully",
        data: history,
      });
    } catch (error) {
      next(error);
    }
  };
}

export = DepreciationController;
