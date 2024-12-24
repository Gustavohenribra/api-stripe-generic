import { Request, Response, NextFunction } from 'express';

export type Action = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;