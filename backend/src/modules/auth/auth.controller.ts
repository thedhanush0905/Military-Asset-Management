import express = require("express");
import AuthService = require("./auth.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public login = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;
      const data = await this.authService.login(email, password);

      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Login successful",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public me = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const userPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        baseId: user.baseId,
      };

      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Profile retrieved successfully",
        data: { user: userPayload },
      });
    } catch (error) {
      next(error);
    }
  };
}

export = AuthController;
