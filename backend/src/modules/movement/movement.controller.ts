import express = require("express");
import MovementService = require("./movement.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class MovementController {
  private readonly movementService: MovementService;

  constructor() {
    this.movementService = new MovementService();
  }

  public getMovementById = async (
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

      const movement = await this.movementService.getMovementById(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Movement record retrieved successfully",
        data: { movement },
      });
    } catch (error) {
      next(error);
    }
  };

  public getMovements = async (
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

      const result = await this.movementService.getMovements(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Movement history retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export = MovementController;
