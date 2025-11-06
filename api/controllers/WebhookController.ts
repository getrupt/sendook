import mongoose from "mongoose";
import Webhook from "../db/mongo/schemas/Webhook";
import type { WebhookEvents } from "../models/Webhook";

export async function createWebhook({
  organizationId,
  url,
  events,
}: {
  organizationId: string;
  url: string;
  events: (typeof WebhookEvents)[number][];
}) {
  const webhook = new Webhook();
  webhook.organizationId = new mongoose.Types.ObjectId(organizationId);
  webhook.url = url;
  webhook.events = events;
  await webhook.save();
}

export async function getWebhooksByOrganizationIdAndEvent({
  organizationId,
  event,
}: {
  organizationId: string;
  event: (typeof WebhookEvents)[number];
}) {
  return await Webhook.find({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    events: { $in: [event] },
  });
}
