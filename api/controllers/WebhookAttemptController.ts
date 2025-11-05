import mongoose from "mongoose";
import type { HydratedDocument } from "mongoose";
import WebhookAttempt from "../db/mongo/schemas/WebhookAttempt";
import type { WebhookEvents } from "../models/Webhook";
import { getWebhooksByOrganizationIdAndEvent } from "./WebhookController";
import type Inbox from "../models/Inbox";
import type Message from "../models/Message";
import axios from "axios";

export async function sendWebhookEvent({
  organizationId,
  event,
  inboxId,
  messageId,
  payload,
}: {
  organizationId: string;
  event: (typeof WebhookEvents)[number];
  inboxId?: string;
  messageId?: string;
  payload: HydratedDocument<Inbox | Message>;
}) {
  const webhooks = await getWebhooksByOrganizationIdAndEvent({
    organizationId,
    event,
  });
  if (!webhooks || webhooks.length === 0) {
    return;
  }

  for (const webhook of webhooks) {
    const webhookAttempt = new WebhookAttempt();
    webhookAttempt.organizationId = new mongoose.Types.ObjectId(organizationId);
    webhookAttempt.webhookId = webhook._id;
    webhookAttempt.inboxId = inboxId ? new mongoose.Types.ObjectId(inboxId) : undefined;
    webhookAttempt.messageId = messageId ? new mongoose.Types.ObjectId(messageId) : undefined;
    webhookAttempt.payload = payload;
    await webhookAttempt.save();

    try {
      const response = await axios.post(webhook.url, {
        event,
        inboxId,
        messageId,
        payload,
      });
      webhookAttempt.status = response.status;
      webhookAttempt.response = response.data;
    } catch (error) {
      webhookAttempt.status = 500;
      webhookAttempt.error = error instanceof Error ? error.message : "Unknown error";
    }

    await webhookAttempt.save();
  }
}
