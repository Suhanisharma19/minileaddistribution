import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err?.statusCode || 500;
  const message = err?.message || 'Internal Server Error';

  // Avoid leaking stack traces in production
  if (process.env.NODE_ENV === 'development') {
    console.error(err?.stack || err);
  } else {
    console.error(message);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err?.stack }),
    requestPath: req.path,
  });
};

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

