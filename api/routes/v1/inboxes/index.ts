import { Router } from "express";
import type { Request, Response } from "express";
import { body } from "express-validator";
import { expressValidatorMiddleware } from "../../../middlewares/expressValidatorMiddleware";
import {
  createInbox,
  deleteInboxByOrganizationIdAndInboxId,
  getInboxByOrganizationIdAndInboxId,
  getInboxesByOrganizationId,
} from "../../../controllers/InboxController";
import { sendWebhookEvent } from "../../../controllers/WebhookAttemptController";
import messagesRouter from "./messages";
import threadsRouter from "./threads";
import { deleteMessagesByInboxId } from "../../../controllers/MessageController";
import { getVerifiedDomainByOrganizationIdAndName } from "../../../controllers/DomainController";

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
  body("name").isString().notEmpty().trim(),
  body("domain").optional().isString().notEmpty().trim(),
  expressValidatorMiddleware,
  async (
    req: Request<
      { organizationId: string },
      {},
      { name: string; domain?: string }
    >,
    res: Response
  ) => {
    let domainId: string | undefined;
    if (req.body.domain) {
      const domain = await getVerifiedDomainByOrganizationIdAndName({
        organizationId: req.organization._id.toString(),
        name: req.body.domain,
      });
      if (!domain) {
        return res.status(404).json({ error: "Domain not found" });
      }

      domainId = domain._id.toString();
    }

    const inbox = await createInbox({
      organization_id: req.organization._id.toString(),
      name: req.body.name,
      domain_id: domainId,
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
