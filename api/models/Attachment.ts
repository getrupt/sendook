import mongoose from "mongoose";

export default interface Attachment {
  id: string;
  organizationId: mongoose.Types.ObjectId;
  inboxId: mongoose.Types.ObjectId;
  messageId: mongoose.Types.ObjectId;
  name: string;
  path: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}
