import type { NextFunction, Request, Response } from "express";
import { getMessagesCountByOrganizationId } from "../controllers/MessageController";
import dayjs from "dayjs";

export const checkMessageLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const messagesCount = await getMessagesCountByOrganizationId({
    organizationId: req.organization._id.toString(),
    startDate: dayjs().startOf("day").toDate(),
    endDate: dayjs().endOf("day").toDate(),
  });
  
  if (messagesCount >= parseInt(process.env.MESSAGE_LIMIT)) {
    res.status(429).json({ error: "Message limit reached" });
    return;
  } else {
    next();
  }
};
