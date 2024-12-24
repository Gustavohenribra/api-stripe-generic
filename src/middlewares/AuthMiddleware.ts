import { Request, Response, NextFunction } from "express";
import HttpException from "../exceptions/HttpException";

const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === "/payment/handleWebhook") {
    return next();
  }

  const apiKey = req.headers["authorization"];

  if (!apiKey) {
    return next(new HttpException(401, "API Key not provided"));
  }

  const validKey = process.env.API_KEY === apiKey;
  if (!validKey) {
    return next(new HttpException(403, "Invalid API Key"));
  }

  next();
};

export default validateApiKey;
