import { Router } from "express";
import passport from "passport";
import type { Request, Response } from "express";
import { getInboxByOrganizationIdAndInboxId } from "../../../controllers/InboxController";
import {
  getThreadById,
  getThreadsByInboxId,
} from "../../../controllers/ThreadController";

const router = Router({ mergeParams: true });

router.get(
  "/",
  async (
    req: Request<{ organizationId: string; inboxId: string }>,
    res: Response
  ) => {
    const inbox = await getInboxByOrganizationIdAndInboxId({
      organizationId: req.organization._id.toString(),
      inboxId: req.params.inboxId!,
    });
    if (!inbox) {
      return res.status(404).json({ error: "Inbox not found" });
    }

    const threads = await getThreadsByInboxId(req.params.inboxId);
    return res.json(threads);
  }
);

router.get(
  "/:threadId",
  async (
    req: Request<{ organizationId: string; inboxId: string; threadId: string }>,
    res: Response
  ) => {
    const thread = await getThreadById(req.params.threadId);
    if (
      !thread ||
      thread.organizationId.toString() !== req.organization._id.toString() ||
      thread.inboxId.toString() !== req.params.inboxId
    ) {
      return res.status(404).json({ error: "Thread not found" });
    }

    return res.json(thread);
  }
);

export default router;
