import { Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  Logger.log(`[${req.method}] ${req.path} ~ ${res.statusCode}`);
  next();
};
