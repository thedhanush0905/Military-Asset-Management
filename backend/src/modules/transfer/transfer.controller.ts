import express = require("express");
import TransferService = require("./transfer.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class TransferController {
  private readonly transferService: TransferService;

  constructor() {
    this.transferService = new TransferService();
  }

  public createTransfer = async (
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

      const transfer = await this.transferService.createTransfer(currentUser, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.CREATED,
        message: "Equipment transfer request created successfully",
        data: { transfer },
      });
    } catch (error) {
      next(error);
    }
  };

  public approveTransfer = async (
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

      const transfer = await this.transferService.approveTransfer(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Equipment transfer request approved successfully",
        data: { transfer },
      });
    } catch (error) {
      next(error);
    }
  };

  public rejectTransfer = async (
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

      const transfer = await this.transferService.rejectTransfer(currentUser, req.params["id"] as string, req.body.remarks);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Equipment transfer request rejected successfully",
        data: { transfer },
      });
    } catch (error) {
      next(error);
    }
  };

  public dispatchTransfer = async (
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

      const transfer = await this.transferService.dispatchTransfer(currentUser, req.params["id"] as string, req.body.remarks);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Equipment transfer dispatched and inventory synced successfully",
        data: { transfer },
      });
    } catch (error) {
      next(error);
    }
  };

  public receiveTransfer = async (
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

      const transfer = await this.transferService.receiveTransfer(currentUser, req.params["id"] as string, req.body.remarks);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Equipment transfer received and destination base inventory synced successfully",
        data: { transfer },
      });
    } catch (error) {
      next(error);
    }
  };

  public cancelTransfer = async (
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

      const transfer = await this.transferService.cancelTransfer(currentUser, req.params["id"] as string, req.body.remarks);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Equipment transfer cancelled successfully",
        data: { transfer },
      });
    } catch (error) {
      next(error);
    }
  };

  public getTransferById = async (
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

      const transfer = await this.transferService.getTransferById(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Equipment transfer record retrieved successfully",
        data: { transfer },
      });
    } catch (error) {
      next(error);
    }
  };

  public getTransfers = async (
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

      const result = await this.transferService.getTransfers(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Transfers retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export = TransferController;
