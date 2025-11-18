import { Router } from "express";
import type { Request, Response } from "express";
import { body } from "express-validator";
import { expressValidatorMiddleware } from "../../../middlewares/expressValidatorMiddleware";
import {
  createWebhook,
  deleteWebhookByOrganizationIdAndId,
  getWebhookById,
  getWebhookByOrganizationIdAndId,
  getWebhooksByOrganizationId,
} from "../../../controllers/WebhookController";
import { WebhookEvents } from "../../../models/Webhook";
import { sendWebhookEvent } from "../../../controllers/WebhookAttemptController";

const router = Router({ mergeParams: true });

router.get(
  "/",
  async (req: Request<{ organizationId: string }, {}, {}>, res: Response) => {
    const webhooks = await getWebhooksByOrganizationId({
      organizationId: req.organization._id.toString(),
    });
    return res.json(webhooks);
  }
);

router.post(
  "/",
  body("url").isString().trim(),
  body("events").isArray().notEmpty(),
  expressValidatorMiddleware,
  async (
    req: Request<
      { organizationId: string },
      {},
      { url: string; events: (typeof WebhookEvents)[number][] }
    >,
    res: Response
  ) => {
    const webhook = await createWebhook({
      organizationId: req.organization._id.toString(),
      url: req.body.url,
      events: req.body.events,
    });
    return res.json(webhook);
  }
);

router.get(
  "/:webhookId",
  async (
    req: Request<{ organizationId: string; webhookId: string }, {}, {}>,
    res: Response
  ) => {
    const webhook = await getWebhookByOrganizationIdAndId({
      organizationId: req.organization._id.toString(),
      id: req.params.webhookId,
    });
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    return res.json(webhook);
  }
);

router.post(
  "/:webhookId/test",
  async (
    req: Request<{ organizationId: string; webhookId: string }, {}, {}>,
    res: Response
  ) => {
    const webhook = await getWebhookByOrganizationIdAndId({
      organizationId: req.organization._id.toString(),
      id: req.params.webhookId,
    });
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    await sendWebhookEvent({
      organizationId: req.organization._id.toString(),
      event: "message.received",
      payload: {
        test: "test",
      }
    });
    return res.json({ message: "Webhook tested" });
  }
);

router.delete(
  "/:webhookId",
  async (
    req: Request<{ organizationId: string; webhookId: string }, {}, {}>,
    res: Response
  ) => {
    const webhook = await getWebhookByOrganizationIdAndId({
      organizationId: req.organization._id.toString(),
      id: req.params.webhookId,
    });
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    await deleteWebhookByOrganizationIdAndId({
      organizationId: req.organization._id.toString(),
      id: req.params.webhookId,
    });
    return res.json(webhook);
  }
);

export default router;
