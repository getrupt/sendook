import mongoose from "mongoose";
import type { HydratedDocument } from "mongoose";
import WebhookAttempt from "../db/mongo/schemas/WebhookAttempt";
import type { WebhookEvents } from "../models/Webhook";
import { getWebhooksByOrganizationIdAndEvent } from "./WebhookController";
import type Inbox from "../models/Inbox";
import type Message from "../models/Message";
import type Webhook from "../models/Webhook";
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
  payload: HydratedDocument<Inbox | Message> | { test: string };
}) {
  const webhooks = await getWebhooksByOrganizationIdAndEvent({
    organizationId,
    event,
  });
  if (!webhooks || webhooks.length === 0) {
    return;
  }

  const webhooksWithoutDuplicates = webhooks.filter(
    (webhook, index, self) =>
      index === self.findIndex((t) => t.url === webhook.url)
  );

  for (const webhook of webhooksWithoutDuplicates) {
    const webhookAttempt = new WebhookAttempt();
    webhookAttempt.organizationId = new mongoose.Types.ObjectId(organizationId);
    webhookAttempt.webhookId = webhook._id;
    webhookAttempt.inboxId = inboxId
      ? new mongoose.Types.ObjectId(inboxId)
      : undefined;
    webhookAttempt.messageId = messageId
      ? new mongoose.Types.ObjectId(messageId)
      : undefined;
    webhookAttempt.payload = {
      event,
      payload,
    };
    webhookAttempt.timestamp = new Date();

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
      webhookAttempt.error =
        error instanceof Error ? error.message : "Unknown error";
    }

    await webhookAttempt.save();
  }
}

export async function getWebhookAttemptsByOrganizationIdAndWebhookId({
  organizationId,
  webhookId,
}: {
  organizationId: string;
  webhookId: string;
}) {
  return await WebhookAttempt.find({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    webhookId: new mongoose.Types.ObjectId(webhookId),
  })
    .sort({ timestamp: -1 })
    .limit(10);
}
