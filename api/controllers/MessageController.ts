import mongoose from "mongoose";
import Message from "../db/mongo/schemas/Message";
import type { MessageStatus } from "../models/Message";

export async function createMessage({
  organizationId,
  inboxId,
  threadId,
  fromInboxId,
  toInboxId,
  from,
  to,
  cc,
  bcc,
  labels,
  externalMessageId,
  subject,
  text,
  html,
  attachments,
  status,
}: {
  organizationId: string;
  inboxId: string;
  threadId: string;
  fromInboxId?: string;
  toInboxId?: string;
  from: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  labels?: string[];
  externalMessageId?: string;
  subject: string;
  text: string;
  html: string;
  attachments?: {
    content: string;
    name?: string;
    contentType?: string;
  }[];
  status?: (typeof MessageStatus)[number];
}) {
  const message = new Message();
  message.organizationId = new mongoose.Types.ObjectId(organizationId);
  message.inboxId = new mongoose.Types.ObjectId(inboxId);
  message.threadId = new mongoose.Types.ObjectId(threadId);
  message.fromInboxId = fromInboxId
    ? new mongoose.Types.ObjectId(fromInboxId)
    : undefined;
  message.toInboxId = toInboxId
    ? new mongoose.Types.ObjectId(toInboxId)
    : undefined;
  message.from = from;
  message.to = to ?? [];
  message.cc = cc ?? [];
  message.bcc = bcc ?? [];
  message.labels = labels ?? [];
  message.externalMessageId = externalMessageId;
  message.subject = subject;
  message.text = text;
  message.html = html;
  message.attachments = new mongoose.Types.Array<{
    content: string;
    name?: string;
    contentType?: string;
  }>();
  if (attachments) {
    for (const attachment of attachments) {
      message.attachments.push({
        content: attachment.content,
        name: attachment.name,
        contentType: attachment.contentType,
      });
    }
  }
  message.status = status;
  await message.save();
  return message;
}

export async function getMessageById(messageId: string) {
  return await Message.findById(messageId);
}

export async function getMessages({
  inboxId,
  query,
}: {
  inboxId: string;
  query?: string;
}) {
  const filter: any = {
    inboxId: new mongoose.Types.ObjectId(inboxId),
  };

  if (query) {
    filter.$or = [
      { subject: { $regex: query, $options: "i" } },
      { text: { $regex: query, $options: "i" } },
      { html: { $regex: query, $options: "i" } },
      { to: { $regex: query, $options: "i" } },
      { cc: { $regex: query, $options: "i" } },
      { bcc: { $regex: query, $options: "i" } },
      { labels: { $regex: query, $options: "i" } },
    ];
  }

  return await Message.find(filter);
}

export async function getMessageByExternalMessageId(externalMessageId: string) {
  return await Message.findOne({ externalMessageId });
}

export async function deleteMessageById(messageId: string) {
  return await Message.findByIdAndDelete(messageId);
}

export async function deleteMessagesByInboxId(inboxId: string) {
  return await Message.deleteMany({
    inboxId: new mongoose.Types.ObjectId(inboxId),
  });
}
