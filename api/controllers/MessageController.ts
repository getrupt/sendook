import mongoose from "mongoose";
import Message from "../db/mongo/schemas/Message";
import type { MessageStatus } from "../models/Message";

export async function createMessage({
  organizationId,
  inboxId,
  fromInboxId,
  toInboxId,
  from,
  to,
  subject,
  text,
  html,
  status,
}: {
  organizationId: string;
  inboxId: string;
  fromInboxId?: string;
  toInboxId?: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  status?: (typeof MessageStatus)[number];
}) {
  const message = new Message();
  message.organizationId = new mongoose.Types.ObjectId(organizationId);
  message.inboxId = new mongoose.Types.ObjectId(inboxId);
  message.fromInboxId = fromInboxId ? new mongoose.Types.ObjectId(fromInboxId) : undefined;
  message.toInboxId = toInboxId ? new mongoose.Types.ObjectId(toInboxId) : undefined;
  message.from = from;
  message.to = to;
  message.subject = subject;
  message.text = text;
  message.html = html;
  message.status = status;
  await message.save();
  return message;
}

export async function getMessageById(messageId: string) {
  return await Message.findById(messageId);
}
