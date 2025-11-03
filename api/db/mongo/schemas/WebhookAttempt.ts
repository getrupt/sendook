import mongoose from "mongoose";
import type IWebhook from "../../../models/Webhook";
import { WebhookEvents } from "../../../models/Webhook";

const webhookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    webhookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Webhook",
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    inboxId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inbox",
      required: false,
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: false,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    payload: {
      type: Object,
      required: true,
    },
    status: {
      type: Number,
      required: true,
    },
    error: {
      type: String,
      required: false,
    },
    response: {
      type: Object,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IWebhook>("Webhook", webhookSchema);
