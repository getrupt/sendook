import mongoose from "mongoose";
import type IWebhook from "../../../models/Webhook";
import { WebhookEvents } from "../../../models/Webhook";

const webhookSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    events: {
      type: [String],
      required: true,
      enum: WebhookEvents,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IWebhook>("Webhook", webhookSchema);
