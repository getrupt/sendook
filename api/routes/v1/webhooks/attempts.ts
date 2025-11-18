import { Router } from "express";
import type { Request, Response } from "express";
import { getWebhookAttemptsByOrganizationIdAndWebhookId } from "../../../controllers/WebhookAttemptController";

const router = Router({ mergeParams: true });

router.get(
  "/",
  async (
    req: Request<
      { organizationId: string; webhookId: string }
    >,
    res: Response
  ) => {
    const webhookAttempts = await getWebhookAttemptsByOrganizationIdAndWebhookId({
      organizationId: req.organization._id.toString(),
      webhookId: req.params.webhookId,
    });

    return res.json(webhookAttempts);
  }
);

export default router;
