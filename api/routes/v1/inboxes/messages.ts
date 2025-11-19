import { Router } from "express";
import passport from "passport";
import { rateLimit } from "express-rate-limit";
import type { Request, Response } from "express";
import { getInboxByOrganizationIdAndInboxId } from "../../../controllers/InboxController";
import {
  createMessage,
  getMessageById,
  getMessages,
} from "../../../controllers/MessageController";
import { sendWebhookEvent } from "../../../controllers/WebhookAttemptController";
import { sendSESMessage } from "../../../controllers/SESController";
import {
  addMessageToThread,
  createThread,
} from "../../../controllers/ThreadController";
import { redis } from "../../../db/redis";
import { RedisStore, type RedisReply } from "rate-limit-redis";
import { checkMessageLimit } from "../../../middlewares/checkMessageLimit";

const connection = redis.duplicate({
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const rateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) =>
			connection.call(command, ...args) as Promise<RedisReply>,
  }),
});

const router = Router({ mergeParams: true });

router.post(
  "/send",
  rateLimiter,
  checkMessageLimit,
  async (
    req: Request<
      { organizationId: string; inboxId: string },
      {},
      {
        to: string[];
        cc?: string[];
        bcc?: string[];
        labels?: string[];
        subject: string;
        text: string;
        html: string;
        attachments?: {
          content: string;
          name?: string;
          contentType?: string;
        }[];
      }
    >,
    res: Response
  ) => {
    const inbox = await getInboxByOrganizationIdAndInboxId({
      organizationId: req.organization._id.toString(),
      inboxId: req.params.inboxId!,
    });
    if (!inbox) {
      return res.status(404).json({ error: "Inbox not found" });
    }

    const thread = await createThread({
      organizationId: req.organization._id.toString(),
      inboxId: req.params.inboxId,
    });

    const message = await createMessage({
      organizationId: req.organization._id.toString(),
      inboxId: req.params.inboxId,
      threadId: thread.id,
      fromInboxId: req.params.inboxId,
      from: inbox.email,
      to: req.body.to ?? [],
      cc: req.body.cc ?? [],
      bcc: req.body.bcc ?? [],
      labels: req.body.labels ?? [],
      subject: req.body.subject,
      text: req.body.text,
      html: req.body.html,
      attachments: req.body.attachments ?? [],
    });

    const sesMessage = await sendSESMessage({
      messageId: message.id,
      from: inbox.email,
      fromName: inbox.name,
      to: req.body.to,
      cc: req.body.cc ?? [],
      bcc: req.body.bcc ?? [],
      subject: req.body.subject,
      text: req.body.text,
      html: req.body.html,
      attachments: req.body.attachments ?? [],
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
      organizationId: req.organization._id.toString(),
      event: "message.sent",
      messageId: message.id,
      payload: message,
    });

    return res.json(message);
  }
);

router.get(
  "/",
  async (
    req: Request<
      { organizationId: string; inboxId: string },
      {},
      {},
      { query?: string }
    >,
    res: Response
  ) => {
    const inbox = await getInboxByOrganizationIdAndInboxId({
      organizationId: req.organization._id.toString(),
      inboxId: req.params.inboxId!,
    });
    if (!inbox) {
      return res.status(404).json({ error: "Inbox not found" });
    }

    const messages = await getMessages({
      inboxId: req.params.inboxId,
      query: req.query?.query,
    });
    return res.json(messages);
  }
);

router.get(
  "/:messageId",
  async (
    req: Request<{
      organizationId: string;
      inboxId: string;
      messageId: string;
    }>,
    res: Response
  ) => {
    const message = await getMessageById(req.params.messageId);
    if (
      !message ||
      message.organizationId.toString() !== req.organization._id.toString()
    ) {
      return res.status(404).json({ error: "Message not found" });
    }

    return res.json(message);
  }
);

router.post(
  "/:messageId/reply",
  rateLimiter,
  checkMessageLimit,
  async (
    req: Request<
      { organizationId: string; inboxId: string; messageId: string },
      {},
      { text: string; html: string }
    >,
    res: Response
  ) => {
    const inbox = await getInboxByOrganizationIdAndInboxId({
      organizationId: req.organization._id.toString(),
      inboxId: req.params.inboxId!,
    });
    if (!inbox) {
      return res.status(404).json({ error: "Inbox not found" });
    }

    const replyToMessage = await getMessageById(req.params.messageId);
    if (
      !replyToMessage ||
      replyToMessage.organizationId.toString() !== req.organization._id.toString()
    ) {
      return res.status(404).json({ error: "Message not found" });
    }

    const message = await createMessage({
      organizationId: req.organization._id.toString(),
      inboxId: req.params.inboxId,
      threadId: replyToMessage.threadId.toString(),
      fromInboxId: req.params.inboxId,
      from: inbox.email,
      to: [replyToMessage.from],
      subject: `Re: ${replyToMessage.subject}`,
      text: req.body.text,
      html: req.body.html,
    });

    const sesMessage = await sendSESMessage({
      messageId: message._id.toString(),
      from: inbox.email,
      fromName: inbox.name,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    if (sesMessage.MessageId) {
      message.externalMessageId = sesMessage.MessageId;
      await message.save();
    }

    await addMessageToThread({
      threadId: replyToMessage.threadId.toString(),
      messageId: message._id.toString(),
    });

    await sendWebhookEvent({
      organizationId: req.organization._id.toString(),
      event: "message.sent",
      messageId: message.id,
      payload: message,
    });

    return res.json(message);
  }
);

export default router;
