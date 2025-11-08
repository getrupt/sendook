import { Router } from "express";
import passport from "passport";
import type { Request, Response } from "express";
import { getInboxByOrganizationIdAndInboxId } from "../../../controllers/InboxController";
import { createMessage, getMessageById, getMessagesByInboxId } from "../../../controllers/MessageController";
import { sendWebhookEvent } from "../../../controllers/WebhookAttemptController";
import { sendSESMessage } from "../../../controllers/SESController";
import type { HydratedDocument } from "mongoose";
import type Organization from "../../../models/Organization";
import { addMessageToThread, createThread } from "../../../controllers/ThreadController";

const router = Router({ mergeParams: true });

router.get(
  "/",
  passport.authenticate("api_key", { session: false }),
  async (req: Request<{ organizationId: string; inboxId: string }>, res: Response) => {
    const organization = req.user as HydratedDocument<Organization>;
    
    // const inbox = await getInboxByOrganizationIdAndInboxId({
    //   organizationId: organization._id.toString(),
    //   inboxId: req.params.inboxId!,
    // });
    // if (!inbox) {
    //   return res.status(404).json({ error: "Inbox not found" });
    // }

    // const messages = await getMessagesByInboxId(req.params.inboxId);
    // return res.json(messages);
  }
);

router.get(
  "/:threadId",
  passport.authenticate("api_key", { session: false }),
  async (req: Request<{ organizationId: string; inboxId: string; messageId: string }>, res: Response) => {
    const organization = req.user as HydratedDocument<Organization>;

    // const message = await getMessageById(req.params.messageId);
    // if (!message || message.organizationId.toString() !== organization._id.toString()) {
    //   return res.status(404).json({ error: "Message not found" });
    // }

    // return res.json(message);
  }
);

export default router;
