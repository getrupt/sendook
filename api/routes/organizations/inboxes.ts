import { Router } from "express";
import passport from "passport";
import type { Request, Response } from "express";
import { getOrganizationById } from "../../controllers/OrganizationController";
import {
  createInbox,
  getNewRandomInboxEmail,
  getInboxesByOrganizationId,
} from "../../controllers/InboxController";
import { body } from "express-validator";
import { expressValidatorMiddleware } from "../../middlewares/expressValidatorMiddleware";
import { sendWebhookEvent } from "../../controllers/WebhookAttemptController";
import messageRouter from "./inboxes/messages";

const router = Router({ mergeParams: true });

router.get(
  "/",
  passport.authenticate("api_key", { session: false }),
  async (req: Request<{ organizationId: string }, {}, {}>, res: Response) => {
    const organization = await getOrganizationById(req.params.organizationId!);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const inboxes = await getInboxesByOrganizationId(
      req.params.organizationId!
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
    const organization = await getOrganizationById(
      req.params.organizationId!
    );
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const inbox = await createInbox({
      organization_id: req.params.organizationId!,
      name: req.body.name,
      email: await getNewRandomInboxEmail({ name: req.body.name }),
    });

    await sendWebhookEvent({
      organizationId: req.params.organizationId,
      event: "inbox.created",
      inboxId: inbox.id,
      payload: inbox,
    });

    return res.json(inbox);
  }
);

router.use("/:inboxId/messages", messageRouter);

export default router;
