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
  return webhook;
}

export async function getWebhookById(id: string) {
  return await Webhook.findById(id);
}

export async function getWebhooksByOrganizationId({
  organizationId,
}: {
  organizationId: string;
}) {
  return await Webhook.find({
    organizationId: new mongoose.Types.ObjectId(organizationId),
  });
}

export async function getWebhookByOrganizationIdAndId({
  organizationId,
  id,
}: {
  organizationId: string;
  id: string;
}) {
  return await Webhook.findOne({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    _id: new mongoose.Types.ObjectId(id.toString()),
  });
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

export async function deleteWebhookByOrganizationIdAndId({
  organizationId,
  id,
}: {
  organizationId: string;
  id: string;
}) {
  return await Webhook.findOneAndDelete({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    _id: new mongoose.Types.ObjectId(id),
  });
}