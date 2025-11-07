import mongoose from "mongoose";

export const WebhookEvents = [
  "inbox.created",
  "inbox.deleted",
  "inbox.updated",
  "message.sent",
  "message.received",
  "message.delivered",
  "message.bounced",
  "message.complained",
  "message.rejected",
] as const;

export default interface Webhook {
  id: string;
  organizationId: mongoose.Types.ObjectId;
  events: (typeof WebhookEvents)[number][];
  url: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}
