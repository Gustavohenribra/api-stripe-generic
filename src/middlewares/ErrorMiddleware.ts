import { Request, Response, NextFunction } from 'express';
import HttpException from '../exceptions/HttpException';

const errorMiddleware = (err: HttpException, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof HttpException) {
    res.status(err.status || 500).json({
      status: err.status,
      message: err.message,
      handlers: err.handlers,
    });
    return;
  }
  
  res.status(500).json({
    status: 500,
    message: 'Internal Server Error',
  });
};

export default errorMiddleware;
