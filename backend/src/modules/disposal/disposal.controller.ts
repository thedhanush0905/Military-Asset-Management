import express = require("express");
import DisposalService = require("./disposal.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class DisposalController {
  private readonly disposalService: DisposalService;

  constructor() {
    this.disposalService = new DisposalService();
  }

  public createDisposal = async (
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

      const disposal = await this.disposalService.createDisposal(currentUser, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.CREATED,
        message: "Disposal request created successfully in PENDING state",
        data: { disposal },
      });
    } catch (error) {
      next(error);
    }
  };

  public approveDisposal = async (
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

      const disposal = await this.disposalService.approveDisposal(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Disposal request approved successfully",
        data: { disposal },
      });
    } catch (error) {
      next(error);
    }
  };

  public completeDisposal = async (
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

      const disposal = await this.disposalService.completeDisposal(
        currentUser,
        req.params["id"] as string,
        req.body
      );
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Disposal completed, asset retired and inventory synced successfully",
        data: { disposal },
      });
    } catch (error) {
      next(error);
    }
  };

  public cancelDisposal = async (
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

      const disposal = await this.disposalService.cancelDisposal(
        currentUser,
        req.params["id"] as string,
        req.body
      );
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Disposal request cancelled successfully",
        data: { disposal },
      });
    } catch (error) {
      next(error);
    }
  };

  public getDisposalById = async (
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

      const disposal = await this.disposalService.getDisposalById(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Disposal record retrieved successfully",
        data: { disposal },
      });
    } catch (error) {
      next(error);
    }
  };

  public getDisposals = async (
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

      const result = await this.disposalService.getDisposals(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Disposal records retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export = DisposalController;
