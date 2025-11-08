import mongoose from "mongoose";
import Thread from "../db/mongo/schemas/Thread";

export async function createThread({
  organizationId,
  inboxId,
}: {
  organizationId: string;
  inboxId: string;
}) {
  const thread = new Thread();
  thread.organizationId = new mongoose.Types.ObjectId(organizationId);
  thread.inboxId = new mongoose.Types.ObjectId(inboxId);
  thread.messages = new mongoose.Types.Array<mongoose.Types.ObjectId>();
  await thread.save();
  return thread;
}

export async function addMessageToThread({
  threadId,
  messageId,
}: {
  threadId: string;
  messageId: string;
}) {
  const thread = await Thread.findById(threadId);
  if (!thread) {
    return null;
  }
  thread.messages.push(new mongoose.Types.ObjectId(messageId));
  await thread.save();
  return thread;
}

export async function getThreadsByInboxId(inboxId: string) {
  const threads = await Thread.find({ inboxId: new mongoose.Types.ObjectId(inboxId) });
  return threads;
}

export async function getThreadById(threadId: string) {
  const thread = await Thread.findById(threadId).populate("messages");
  return thread;
}
