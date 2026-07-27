import express = require("express");
import SystemConfigService = require("./system-config.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class SystemConfigController {
  private readonly configService: SystemConfigService;

  constructor() {
    this.configService = new SystemConfigService();
  }

  public getConfig = async (
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

      const config = await this.configService.getConfig(currentUser, req.params["key"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "System configuration loaded successfully",
        data: config,
      });
    } catch (error) {
      next(error);
    }
  };

  public getAllConfigs = async (
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

      const configs = await this.configService.getAllConfigs(currentUser);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "All system configurations loaded successfully",
        data: configs,
      });
    } catch (error) {
      next(error);
    }
  };

  public upsertConfig = async (
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

      const { key, value, description } = req.body;
      const config = await this.configService.upsertConfig(currentUser, key, value, description);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "System configuration saved successfully",
        data: config,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteConfig = async (
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

      const deleted = await this.configService.deleteConfig(currentUser, req.params["key"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "System configuration deleted successfully",
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  };
}

export = SystemConfigController;
