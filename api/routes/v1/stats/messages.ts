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
    return res.json({
      count: messagesCount,
      limit: parseInt(process.env.MESSAGE_LIMIT),
      percentage: messagesCount / parseInt(process.env.MESSAGE_LIMIT) * 100,
    });
  }
);

export default router;
