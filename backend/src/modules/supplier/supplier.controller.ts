import express = require("express");
import SupplierService = require("./supplier.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class SupplierController {
  private readonly supplierService: SupplierService;

  constructor() {
    this.supplierService = new SupplierService();
  }

  public createSupplier = async (
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

      const supplier = await this.supplierService.createSupplier(currentUser, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.CREATED,
        message: "Supplier created successfully",
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateSupplier = async (
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

      const supplier = await this.supplierService.updateSupplier(currentUser, req.params["id"] as string, req.body);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Supplier updated successfully",
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  };

  public getSupplierById = async (
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

      const supplier = await this.supplierService.getSupplierById(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Supplier details loaded successfully",
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  };

  public getSuppliers = async (
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

      const result = await this.supplierService.getSuppliers(currentUser, req.query);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Suppliers list loaded successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteSupplier = async (
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

      const supplier = await this.supplierService.deleteSupplier(currentUser, req.params["id"] as string);
      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Supplier deleted successfully",
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  };
}

export = SupplierController;
