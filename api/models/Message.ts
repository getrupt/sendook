import mongoose from "mongoose";

export default interface Message {
  id: string;
  organizationId: mongoose.Types.ObjectId;
  inboxId: mongoose.Types.ObjectId;
  threadId: mongoose.Types.ObjectId;
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments: mongoose.Types.Array<mongoose.Types.ObjectId>;
  createdAt: Date | null;
  updatedAt: Date | null;
}
