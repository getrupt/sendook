import mongoose from "mongoose";

export default interface WebhookAttempt {
  id: string;
  organizationId: mongoose.Types.ObjectId;
  webhookId: mongoose.Types.ObjectId;
  inboxId?: mongoose.Types.ObjectId;
  messageId?: mongoose.Types.ObjectId;
  timestamp: Date;
  payload: any;
  status: number;
  error: string | null;
  response: any;
  createdAt: Date | null;
  updatedAt: Date | null;
}
