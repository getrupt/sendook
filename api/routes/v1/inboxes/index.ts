import { Router } from "express";
import type { Request, Response } from "express";
import { body } from "express-validator";
import { expressValidatorMiddleware } from "../../../middlewares/expressValidatorMiddleware";
import {
  createInbox,
  deleteInboxByOrganizationIdAndInboxId,
  getInboxByEmail,
  getInboxByOrganizationIdAndInboxId,
  getInboxesByOrganizationId,
  getNewRandomInboxEmail,
} from "../../../controllers/InboxController";
import { sendWebhookEvent } from "../../../controllers/WebhookAttemptController";
import messagesRouter from "./messages";
import threadsRouter from "./threads";
import { deleteMessagesByInboxId } from "../../../controllers/MessageController";
import { getVerifiedDomainByOrganizationIdAndName } from "../../../controllers/DomainController";
import type Inbox from "../../../models/Inbox";

const router = Router({ mergeParams: true });

router.get(
  "/",
  async (req: Request<{ organizationId: string }, {}, {}>, res: Response) => {
    const inboxes = await getInboxesByOrganizationId(
      req.organization._id.toString()
    );
    return res.json(inboxes);
  }
);

router.post(
  "/",
  body("name").optional().isString().trim().notEmpty(),
  body("email").optional().isEmail().trim(),
  expressValidatorMiddleware,
  async (
    req: Request<
      { organizationId: string },
      {},
      { name?: string; email?: string }
    >,
    res: Response
  ) => {
    let domainId: string | undefined;
    let email: string | undefined;

    if (req.body.email) {
      const domainName = req.body.email?.split("@")[1];
      if (!domainName) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      if (domainName !== process.env.DEFAULT_EMAIL_DOMAIN) {
        const domain = await getVerifiedDomainByOrganizationIdAndName({
          organizationId: req.organization._id.toString(),
          name: domainName,
        });

        if (!domain) {
          return res.status(404).json({ error: "Invalid domain name" });
        }
        
        domainId = domain._id.toString();
      }

      email = req.body.email;
    }

    if (!email) {
      email = await getNewRandomInboxEmail({ name: req.body.name ?? "inbox" });
    }

    if (await getInboxByEmail(email)) {
      return res.status(400).json({ error: "Inbox with this email already exists" });
    }

    const inbox = await createInbox({
      organization_id: req.organization._id.toString(),
      name: req.body.name,
      domain_id: domainId,
      email,
    });

    await sendWebhookEvent({
      organizationId: req.organization._id.toString(),
      event: "inbox.created",
      inboxId: inbox.id,
      payload: inbox,
    });

    return res.json(inbox);
  }
);

router.get(
  "/:inboxId",
  async (
    req: Request<{ organizationId: string; inboxId: string }, {}, {}>,
    res: Response
  ) => {
    const inbox = await getInboxByOrganizationIdAndInboxId({
      organizationId: req.organization._id.toString(),
      inboxId: req.params.inboxId,
    });
    if (!inbox) {
      return res.status(404).json({ error: "Inbox not found" });
    }
    return res.json(inbox);
  }
);

router.delete(
  "/:inboxId",
  async (
    req: Request<{ organizationId: string; inboxId: string }, {}, {}>,
    res: Response
  ) => {
    const deletedInbox = await deleteInboxByOrganizationIdAndInboxId({
      organizationId: req.organization._id.toString(),
      inboxId: req.params.inboxId,
    });
    if (!deletedInbox) {
      return res.status(404).json({ error: "Inbox not found" });
    }
    await deleteMessagesByInboxId(req.params.inboxId);
    await sendWebhookEvent({
      organizationId: req.organization._id.toString(),
      event: "inbox.deleted",
      inboxId: deletedInbox._id.toString(),
      payload: deletedInbox,
    });
    return res.json(deletedInbox);
  }
);

router.use("/:inboxId/messages", messagesRouter);
router.use("/:inboxId/threads", threadsRouter);

export default router;
