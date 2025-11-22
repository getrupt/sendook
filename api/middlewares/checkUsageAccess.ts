import type { NextFunction, Request, Response } from "express";
import { chargeUsage } from "../controllers/UsageController";

export const checkUsageAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await chargeUsage({
      organizationId: req.organization._id.toString(),
      stripeCustomerId: req.organization.stripeCustomerId,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Usage limit reached"
    ) {
      res
        .status(429)
        .json({
          errors: [
            {
              msg: "Usage limit reached. Add a payment method to your account to make more requests.",
            },
          ],
        });
      return;
    }
    throw error;
  }
  next();
};