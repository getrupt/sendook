import mongoose from "mongoose";
import type IWebhook from "../../../models/Webhook";
import { WebhookEvents } from "../../../models/Webhook";

const webhookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    event: {
      type: String,
      required: true,
      enum: WebhookEvents,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IWebhook>("Webhook", webhookSchema);
