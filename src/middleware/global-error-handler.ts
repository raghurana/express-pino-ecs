import { Request, Response, NextFunction } from "express";

export const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }