import express = require("express");
import QRService = require("./qr.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");
import ValidationError = require("../../shared/errors/ValidationError.js");

class QRController {
  private readonly qrService: QRService;

  constructor() {
    this.qrService = new QRService();
  }

  public generateAssetQR = async (
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

      const assetId = req.params["assetId"] as string;
      if (!assetId) {
        throw new ValidationError("Asset ID is required");
      }

      const dataUrl = await this.qrService.generateAssetQR(currentUser, assetId);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "QR Code generated successfully",
        data: { qrCodeUrl: dataUrl },
      });
    } catch (error) {
      next(error);
    }
  };

  public resolveScannedQR = async (
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

      const { payload } = req.body;
      if (!payload) {
        throw new ValidationError("QR Code scan payload is required");
      }

      const asset = await this.qrService.resolveScannedQR(currentUser, payload);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "QR Code successfully resolved to asset details",
        data: asset,
      });
    } catch (error) {
      next(error);
    }
  };
}

export = QRController;
