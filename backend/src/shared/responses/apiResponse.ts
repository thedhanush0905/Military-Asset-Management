import express = require("express");

interface SuccessResponseParams<T = any> {
  res: express.Response;
  statusCode: number;
  message: string;
  data?: T;
}

interface ErrorResponseParams {
  res: express.Response;
  statusCode: number;
  message: string;
  stack?: string;
}

interface ValidationResponseParams {
  res: express.Response;
  statusCode: number;
  message: string;
  details: unknown[];
  stack?: string;
}

const successResponse = <T>({
  res,
  statusCode,
  message,
  data,
}: SuccessResponseParams<T>): express.Response => {
  const payload: any = {
    success: true,
    message,
  };
  if (data !== undefined) {
    payload.data = data;
  }
  return res.status(statusCode).json(payload);
};

const errorResponse = ({
  res,
  statusCode,
  message,
  stack,
}: ErrorResponseParams): express.Response => {
  const payload: any = {
    success: false,
    message,
  };
  if (stack && process.env["NODE_ENV"] !== "production") {
    payload.stack = stack;
  }
  return res.status(statusCode).json(payload);
};

const validationResponse = ({
  res,
  statusCode,
  message,
  details,
  stack,
}: ValidationResponseParams): express.Response => {
  const payload: any = {
    success: false,
    message,
    details,
  };
  if (stack && process.env["NODE_ENV"] !== "production") {
    payload.stack = stack;
  }
  return res.status(statusCode).json(payload);
};

const apiResponse = {
  successResponse,
  errorResponse,
  validationResponse,
};

export = apiResponse;
