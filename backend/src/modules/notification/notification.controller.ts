import express = require("express");
import NotificationService = require("./notification.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class NotificationController {
  private readonly notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  public getNotifications = async (
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

      const result = await this.notificationService.getNotifications(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Notifications retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getUnreadNotifications = async (
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

      const notifications = await this.notificationService.getUnreadNotifications(currentUser);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Unread notifications retrieved successfully",
        data: { notifications },
      });
    } catch (error) {
      next(error);
    }
  };

  public markAsRead = async (
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

      const notification = await this.notificationService.markAsRead(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Notification marked as read",
        data: { notification },
      });
    } catch (error) {
      next(error);
    }
  };

  public markAllAsRead = async (
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

      await this.notificationService.markAllAsRead(currentUser);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "All notifications marked as read",
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteNotification = async (
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

      const deleted = await this.notificationService.deleteNotification(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Notification deleted successfully",
        data: { notification: deleted },
      });
    } catch (error) {
      next(error);
    }
  };
}

export = NotificationController;
