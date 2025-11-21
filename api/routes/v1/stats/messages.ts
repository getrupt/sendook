import { Router } from "express";
import type { Request, Response } from "express";
import { getMessagesCountByOrganizationId } from "../../../controllers/MessageController";
import dayjs from "dayjs";

const router = Router({ mergeParams: true });

router.get(
  "/daily",
  async (
    req: Request<{ organizationId: string; inboxId: string }>,
    res: Response
  ) => {
    const messagesCount = await getMessagesCountByOrganizationId({
      organizationId: req.organization._id.toString(),
      startDate: dayjs().startOf("day").toDate(),
      endDate: dayjs().endOf("day").toDate(),
    });
    
    const dailyMessageLimit = req.organization.dailyMessageLimit ?? parseInt(process.env.MESSAGE_LIMIT || '100', 10);  

    if (isNaN(dailyMessageLimit) || dailyMessageLimit < 0) {
      return res.status(500).json({ error: "Invalid message limit configuration" });
    }

    return res.json({
      count: messagesCount,
      limit: dailyMessageLimit,
      percentage: dailyMessageLimit > 0 ? (messagesCount / dailyMessageLimit * 100) : 0,
    });
  }
);

export default router;
