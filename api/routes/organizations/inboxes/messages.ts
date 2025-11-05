import { Router } from "express";
import passport from "passport";
import type { Request, Response } from "express";
import { getOrganizationById } from "../../../controllers/OrganizationController";
import { getInboxByOrganizationIdAndInboxId } from "../../../controllers/InboxController";
import { createMessage } from "../../../controllers/MessageController";
import { sendWebhookEvent } from "../../../controllers/WebhookAttemptController";
import { sendSESMessage } from "../../../controllers/SESController";

const router = Router({ mergeParams: true });

router.post(
  "/",
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
    const organization = await getOrganizationById(req.params.organizationId!);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const inbox = await getInboxByOrganizationIdAndInboxId({
      organizationId: req.params.organizationId!,
      inboxId: req.params.inboxId!,
    });
    if (!inbox) {
      return res.status(404).json({ error: "Inbox not found" });
    }

    const message = await createMessage({
      organizationId: req.params.organizationId,
      inboxId: req.params.inboxId,
      fromInboxId: req.params.inboxId,
      from: inbox.email,
      to: req.body.to,
      subject: req.body.subject,
      text: req.body.text,
      html: req.body.html,
    });

    sendSESMessage({
      messageId: message.id,
      from: inbox.email,
      fromName: inbox.name,
      to: req.body.to,
      subject: req.body.subject,
      text: req.body.text,
      html: req.body.html,
    });
    
    await sendWebhookEvent({
      organizationId: req.params.organizationId,
      event: "message.sent",
      messageId: message.id,
      payload: message,
    });

    return res.json(message);
  }
);

export default router;
