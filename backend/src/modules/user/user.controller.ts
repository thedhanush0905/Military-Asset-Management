import express = require("express");
import UserService = require("./user.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class UserController {
  private readonly userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public createUser = async (
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

      const user = await this.userService.createUser(currentUser, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.CREATED,
        message: "User created successfully",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (
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

      const user = await this.userService.findUserById(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "User retrieved successfully",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public getUsers = async (
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

      const result = await this.userService.findUsers(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Users retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (
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

      const user = await this.userService.updateUser(currentUser, req.params["id"] as string, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "User updated successfully",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateUserStatus = async (
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

      const user = await this.userService.updateUser(currentUser, req.params["id"] as string, {
        status: req.body.status,
      });

      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "User status updated successfully",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public deactivateUser = async (
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

      const user = await this.userService.deactivateUser(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "User deactivated successfully",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };
}

export = UserController;
