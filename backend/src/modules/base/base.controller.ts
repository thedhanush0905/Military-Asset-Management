import express = require("express");
import BaseService = require("./base.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class BaseController {
  private readonly baseService: BaseService;

  constructor() {
    this.baseService = new BaseService();
  }

  public createBase = async (
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

      const base = await this.baseService.createBase(currentUser, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.CREATED,
        message: "Base created successfully",
        data: { base },
      });
    } catch (error) {
      next(error);
    }
  };

  public getBases = async (
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

      const result = await this.baseService.getBases(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Bases retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getBaseById = async (
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

      const base = await this.baseService.getBaseById(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Base retrieved successfully",
        data: { base },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateBase = async (
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

      const base = await this.baseService.updateBase(currentUser, req.params["id"] as string, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Base updated successfully",
        data: { base },
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteBase = async (
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

      const base = await this.baseService.deleteBase(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Base deleted successfully",
        data: { base },
      });
    } catch (error) {
      next(error);
    }
  };
}

export = BaseController;
