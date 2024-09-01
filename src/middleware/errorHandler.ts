import { Request, Response, NextFunction } from "express";

export function errorHandler(
  error: any, // this should be an unknown instead of any
  _request: Request,
  response: Response,
  next: NextFunction,
): void {
  console.error("Middleware Error", error);
  // this would be a fully realized error handler
  response.status(error.status || 500).json({
    error: {
      message: error.message || "Internal Server Error",
    },
  });
}
