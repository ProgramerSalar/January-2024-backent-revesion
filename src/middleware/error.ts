import express, { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import { ControllerType } from "../types/types.js";

export const errorMiddleware = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.message ||= "Internal server Error";
  err.statusCode ||= 500;

  if(err.statusCode === 11000){
    res.send("Duplicate Value Enter")
  }

  return res.status(err.statusCode).json({
    success: false,
    message: console.log(err)
  });
};

export const TryCatch =
  (func: ControllerType) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req, res, next));
  };
              