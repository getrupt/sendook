import mongoose from "mongoose";
import type IWebhookAttempt from "../../../models/WebhookAttempt";

const webhookAttemptSchema = new mongoose.Schema(
  {
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

export default mongoose.model<IWebhookAttempt>("WebhookAttempt", webhookAttemptSchema);
