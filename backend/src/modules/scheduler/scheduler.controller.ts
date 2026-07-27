import express = require("express");
import Scheduler = require("../../shared/scheduler/scheduler.js");
import apiResponse = require("../../shared/responses/apiResponse.js");
import HttpStatus = require("../../constants/httpStatus.js");
import ValidationError = require("../../shared/errors/ValidationError.js");

class SchedulerController {
  public triggerJob = async (
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

      const jobName = req.params["jobName"] as string;
      if (!jobName) {
        throw new ValidationError("Job name parameter is required");
      }

      const scheduler = Scheduler.getInstance();
      await scheduler.triggerJob(jobName);

      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: `Job '${jobName}' triggered and completed successfully`,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };

  public getJobs = async (
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

      const scheduler = Scheduler.getInstance();
      const jobs = scheduler.getRegisteredJobs();

      apiResponse.successResponse({
        res,
        statusCode: HttpStatus.OK,
        message: "Registered jobs fetched successfully",
        data: { jobs },
      });
    } catch (error) {
      next(error);
    }
  };
}

export = SchedulerController;
