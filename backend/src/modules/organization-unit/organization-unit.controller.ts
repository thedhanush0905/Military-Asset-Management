import express = require("express");
import OrganizationUnitService = require("./organization-unit.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class OrganizationUnitController {
  private readonly unitService: OrganizationUnitService;

  constructor() {
    this.unitService = new OrganizationUnitService();
  }

  public createUnit = async (
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

      const unit = await this.unitService.createUnit(currentUser, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.CREATED,
        message: "Organizational unit created successfully",
        data: unit,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateUnit = async (
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

      const unit = await this.unitService.updateUnit(currentUser, req.params["id"] as string, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Organizational unit updated successfully",
        data: unit,
      });
    } catch (error) {
      next(error);
    }
  };

  public getUnitById = async (
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

      const unit = await this.unitService.getUnitById(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Organizational unit details loaded successfully",
        data: unit,
      });
    } catch (error) {
      next(error);
    }
  };

  public getUnitsTree = async (
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

      const tree = await this.unitService.getUnitsTree(currentUser);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Organizational units hierarchy tree loaded successfully",
        data: tree,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteUnit = async (
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

      const unit = await this.unitService.deleteUnit(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Organizational unit deleted successfully",
        data: unit,
      });
    } catch (error) {
      next(error);
    }
  };
}

export = OrganizationUnitController;
