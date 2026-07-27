import express = require("express");
import GlobalSearchService = require("./search.service.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");

class GlobalSearchController {
  private readonly searchService: GlobalSearchService;

  constructor() {
    this.searchService = new GlobalSearchService();
  }

  public search = async (
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

      const query = req.query["q"] as string;
      const limit = req.query["limit"] ? Number(req.query["limit"]) : undefined;

      const results = await this.searchService.search(currentUser, query, limit);

      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Search completed successfully",
        data: { results },
      });
    } catch (error) {
      next(error);
    }
  };
}

export = GlobalSearchController;
