import mongoose from "mongoose";

export const WebhookEvents = [
  "inbox.created",
  "inbox.deleted",
  "inbox.updated",
  "message.created",
  "message.deleted",
  "message.updated",
] as const;

export default interface Webhook {
  id: string;
  organizationId: mongoose.Types.ObjectId;
  event: (typeof WebhookEvents)[number];
  createdAt: Date | null;
  updatedAt: Date | null;
}
