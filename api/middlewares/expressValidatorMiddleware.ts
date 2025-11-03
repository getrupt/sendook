import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export const expressValidatorMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  } else {
    next();
  }
};
