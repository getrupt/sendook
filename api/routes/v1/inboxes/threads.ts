import { Router } from "express";
import passport from "passport";
import type { Request, Response } from "express";
import { getInboxByOrganizationIdAndInboxId } from "../../../controllers/InboxController";
import type { HydratedDocument } from "mongoose";
import type Organization from "../../../models/Organization";
import {
  getThreadById,
  getThreadsByInboxId,
} from "../../../controllers/ThreadController";

const router = Router({ mergeParams: true });

router.get(
  "/",
  passport.authenticate("api_key", { session: false }),
  async (
    req: Request<{ organizationId: string; inboxId: string }>,
    res: Response
  ) => {
    const organization = req.user as HydratedDocument<Organization>;

    const inbox = await getInboxByOrganizationIdAndInboxId({
      organizationId: organization._id.toString(),
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
  passport.authenticate("api_key", { session: false }),
  async (
    req: Request<{ organizationId: string; inboxId: string; threadId: string }>,
    res: Response
  ) => {
    const organization = req.user as HydratedDocument<Organization>;

    const thread = await getThreadById(req.params.threadId);
    if (
      !thread ||
      thread.organizationId.toString() !== organization._id.toString() ||
      thread.inboxId.toString() !== req.params.inboxId
    ) {
      return res.status(404).json({ error: "Thread not found" });
    }

    return res.json(thread);
  }
);

export default router;
