import mongoose from "mongoose";
import type IMessage from "../../../models/Message";
import { MessageStatus } from "../../../models/Message";

const messageSchema = new mongoose.Schema(
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
    inboxId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inbox",
      required: true,
    },
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      required: true,
    },
    fromInboxId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inbox",
      required: false,
    },
    from: {
      type: String,
      required: true,
    },
    toInboxId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inbox",
      required: false,
    },
    to: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    html: {
      type: String,
      required: true,
    },
    attachments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Attachment",
      required: false,
    },
    status: {
      type: String,
      required: false,
      enum: MessageStatus,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMessage>("Message", messageSchema);
