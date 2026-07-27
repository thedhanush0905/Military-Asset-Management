import express = require("express");
import PersonnelService = require("./personnel.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class PersonnelController {
  private readonly personnelService: PersonnelService;

  constructor() {
    this.personnelService = new PersonnelService();
  }

  public createPersonnel = async (
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

      const profile = await this.personnelService.createPersonnel(currentUser, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.CREATED,
        message: "Personnel profile created successfully",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  public updatePersonnel = async (
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

      const profile = await this.personnelService.updatePersonnel(currentUser, req.params["id"] as string, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Personnel profile updated successfully",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  public getPersonnelById = async (
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

      const profile = await this.personnelService.getPersonnelById(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Personnel details loaded successfully",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  public getPersonnelList = async (
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

      const result = await this.personnelService.getPersonnelList(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Personnel list loaded successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public deletePersonnel = async (
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

      const deleted = await this.personnelService.deletePersonnel(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Personnel profile deleted successfully",
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  };
}

export = PersonnelController;
