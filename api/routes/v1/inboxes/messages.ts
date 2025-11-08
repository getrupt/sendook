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

router.post(
  "/send",
  passport.authenticate("api_key", { session: false }),
  async (
    req: Request<
      { organizationId: string; inboxId: string },
      {},
      {
        to: string;
        subject: string;
        text: string;
        html: string;
      }
    >,
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

    const thread = await createThread({
      organizationId: organization._id.toString(),
      inboxId: req.params.inboxId,
    });

    const message = await createMessage({
      organizationId: organization._id.toString(),
      inboxId: req.params.inboxId,
      threadId: thread.id,
      fromInboxId: req.params.inboxId,
      from: inbox.email,
      to: req.body.to,
      subject: req.body.subject,
      text: req.body.text,
      html: req.body.html,
    });

    const sesMessage = await sendSESMessage({
      messageId: message.id,
      from: inbox.email,
      fromName: inbox.name,
      to: req.body.to,
      subject: req.body.subject,
      text: req.body.text,
      html: req.body.html,
    });
    
    if (sesMessage.MessageId) {
      message.externalMessageId = sesMessage.MessageId;
      await message.save();
    }
    
    await addMessageToThread({
      threadId: thread._id.toString(),
      messageId: message._id.toString(),
    });

    await sendWebhookEvent({
      organizationId: organization._id.toString(),
      event: "message.sent",
      messageId: message.id,
      payload: message,
    });

    return res.json(message);
  }
);

router.get(
  "/",
  passport.authenticate("api_key", { session: false }),
  async (req: Request<{ organizationId: string; inboxId: string }>, res: Response) => {
    const organization = req.user as HydratedDocument<Organization>;
    
    const inbox = await getInboxByOrganizationIdAndInboxId({
      organizationId: organization._id.toString(),
      inboxId: req.params.inboxId!,
    });
    if (!inbox) {
      return res.status(404).json({ error: "Inbox not found" });
    }

    const messages = await getMessagesByInboxId(req.params.inboxId);
    console.log(messages);
    return res.json(messages);
  }
);

router.get(
  "/:messageId",
  passport.authenticate("api_key", { session: false }),
  async (req: Request<{ organizationId: string; inboxId: string; messageId: string }>, res: Response) => {
    const organization = req.user as HydratedDocument<Organization>;

    const message = await getMessageById(req.params.messageId);
    if (!message || message.organizationId.toString() !== organization._id.toString()) {
      return res.status(404).json({ error: "Message not found" });
    }

    return res.json(message);
  }
);

export default router;
