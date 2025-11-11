import { Router } from "express";
import passport from "passport";
import type { Request, Response } from "express";
import { body } from "express-validator";
import type { HydratedDocument } from "mongoose";
import type Organization from "../../../models/Organization";
import { expressValidatorMiddleware } from "../../../middlewares/expressValidatorMiddleware";
import { createInbox, deleteInboxByOrganizationIdAndInboxId, getInboxByOrganizationIdAndInboxId, getInboxesByOrganizationId } from "../../../controllers/InboxController";
import { sendWebhookEvent } from "../../../controllers/WebhookAttemptController";
import messagesRouter from "./messages";
import threadsRouter from "./threads";
import { deleteMessagesByInboxId } from "../../../controllers/MessageController";

const router = Router({ mergeParams: true });

router.get(
  "/",
  passport.authenticate("api_key", { session: false }),
  async (req: Request<{ organizationId: string }, {}, {}>, res: Response) => {
    const organization = req.user as HydratedDocument<Organization>;
    const inboxes = await getInboxesByOrganizationId(
      organization._id.toString()
    );
    return res.json(inboxes);
  }
);

router.post(
  "/",
  body("name").isString().notEmpty().trim(),
  expressValidatorMiddleware,
  passport.authenticate("api_key", { session: false }),
  async (
    req: Request<{ organizationId: string }, {}, { name: string }>,
    res: Response
  ) => {
    const organization = req.user as HydratedDocument<Organization>;
    const inbox = await createInbox({
      organization_id: organization._id.toString(),
      name: req.body.name,
    });

    await sendWebhookEvent({
      organizationId: organization._id.toString(),
      event: "inbox.created",
      inboxId: inbox.id,
      payload: inbox,
    });

    return res.json(inbox);
  }
);

router.get(
  "/:inboxId",
  passport.authenticate("api_key", { session: false }),
  async (req: Request<{ organizationId: string, inboxId: string }, {}, {}>, res: Response) => {
    const organization = req.user as HydratedDocument<Organization>;
    const inbox = await getInboxByOrganizationIdAndInboxId({
      organizationId: organization._id.toString(),
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
  passport.authenticate("api_key", { session: false }),
  async (req: Request<{ organizationId: string, inboxId: string }, {}, {}>, res: Response) => {
    const organization = req.user as HydratedDocument<Organization>;
    const deletedInbox = await deleteInboxByOrganizationIdAndInboxId({
      organizationId: organization._id.toString(),
      inboxId: req.params.inboxId,
    });
    if (!deletedInbox) {
      return res.status(404).json({ error: "Inbox not found" });
    }
    await deleteMessagesByInboxId(req.params.inboxId);
    await sendWebhookEvent({
      organizationId: organization._id.toString(),
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
