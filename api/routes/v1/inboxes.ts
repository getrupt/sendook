import { Router } from "express";
import passport from "passport";
import type { Request, Response } from "express";
import { body } from "express-validator";
import type { HydratedDocument } from "mongoose";
import type Organization from "../../models/Organization";
import { expressValidatorMiddleware } from "../../middlewares/expressValidatorMiddleware";
import { createInbox, getInboxesByOrganizationId, getNewRandomInboxEmail } from "../../controllers/InboxController";
import { sendWebhookEvent } from "../../controllers/WebhookAttemptController";

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
      email: await getNewRandomInboxEmail({ name: req.body.name }),
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

// router.use("/:inboxId/messages", messageRouter);

export default router;
