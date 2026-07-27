import express = require("express");
import AssignmentService = require("./assignment.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class AssignmentController {
  private readonly assignmentService: AssignmentService;

  constructor() {
    this.assignmentService = new AssignmentService();
  }

  public createAssignment = async (
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

      const assignment = await this.assignmentService.createAssignment(currentUser, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.CREATED,
        message: "Asset assigned and inventory synced successfully",
        data: { assignment },
      });
    } catch (error) {
      next(error);
    }
  };

  public returnAssignment = async (
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

      const assignment = await this.assignmentService.returnAssignment(
        currentUser,
        req.params["id"] as string,
        req.body.remarks
      );
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Asset returned and inventory synced successfully",
        data: { assignment },
      });
    } catch (error) {
      next(error);
    }
  };

  public getAssignmentById = async (
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

      const assignment = await this.assignmentService.getAssignmentById(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Assignment retrieved successfully",
        data: { assignment },
      });
    } catch (error) {
      next(error);
    }
  };

  public getAssignments = async (
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

      const result = await this.assignmentService.getAssignments(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Assignments retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getActiveAssignments = async (
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

      const result = await this.assignmentService.getActiveAssignments(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Active assignments retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getAssignmentHistory = async (
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

      const result = await this.assignmentService.getAssignmentHistory(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Assignment history retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export = AssignmentController;
