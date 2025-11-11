import mongoose from "mongoose";

export const MessageStatus = [
  "sent",
  "received",
  "delivered",
  "bounced",
  "complained",
  "rejected",
] as const;

export default interface Message {
  id: string;
  organizationId: mongoose.Types.ObjectId;
  inboxId: mongoose.Types.ObjectId;
  threadId: mongoose.Types.ObjectId;
  fromInboxId?: mongoose.Types.ObjectId;
  from: string;
  toInboxId?: mongoose.Types.ObjectId;
  externalMessageId?: string;
  to?: string[];
  cc: string[];
  bcc: string[];
  labels: string[];
  subject: string;
  text: string;
  html: string;
  attachments?: mongoose.Types.Array<{
    content: string;
    name?: string;
    contentType?: string;
  }>;
  status?: (typeof MessageStatus)[number];
  createdAt: Date | null;
  updatedAt: Date | null;
}
