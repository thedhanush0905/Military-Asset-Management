import express = require("express");
import helmet = require("helmet");
import cors = require("cors");
import morgan = require("morgan");
import notFoundHandler = require("./middleware/notFound.middleware.js");
import errorHandler = require("./middleware/error.middleware.js");
import apiResponse = require("./shared/responses/apiResponse.js");
import HttpStatus = require("./constants/httpStatus.js");
import Messages = require("./constants/messages.js");

const app = express();

app.use(helmet.default());
app.use(cors());

const morganFormat = process.env["NODE_ENV"] === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  apiResponse.successResponse({
    res,
    statusCode: HttpStatus.OK,
    message: Messages.SERVER_RUNNING,
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

export = app;
