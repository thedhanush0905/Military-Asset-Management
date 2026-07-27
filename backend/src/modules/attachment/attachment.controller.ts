import express = require("express");
import AttachmentService = require("./attachment.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");
import ValidationError = require("../../shared/errors/ValidationError.js");

class AttachmentController {
  private readonly attachmentService: AttachmentService;

  constructor() {
    this.attachmentService = new AttachmentService();
  }

  public uploadAttachment = async (
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

      if (!req.file) {
        throw new ValidationError("No file uploaded in request");
      }

      const { entityType, entityId } = req.body;
      const fileData = {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer,
      };

      const attachment = await this.attachmentService.uploadAttachment(
        currentUser,
        fileData,
        entityType,
        entityId
      );

      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.CREATED,
        message: "Attachment uploaded successfully",
        data: attachment,
      });
    } catch (error) {
      next(error);
    }
  };

  public downloadAttachment = async (
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

      const { filename, mimeType, buffer } = await this.attachmentService.downloadAttachment(
        currentUser,
        req.params["id"] as string
      );

      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", mimeType);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };

  public getEntityAttachments = async (
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

      const { entityType, entityId } = req.params;
      const attachments = await this.attachmentService.getEntityAttachments(
        currentUser,
        entityType as string,
        entityId as string
      );

      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Entity attachments loaded successfully",
        data: attachments,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteAttachment = async (
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

      const deleted = await this.attachmentService.deleteAttachment(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Attachment soft-deleted successfully",
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  };
}

export = AttachmentController;
