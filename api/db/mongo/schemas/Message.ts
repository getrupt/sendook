import mongoose from "mongoose";
import type IMessage from "../../../models/Message";
import { MessageStatus } from "../../../models/Message";

const messageSchema = new mongoose.Schema(
  {
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
    externalMessageId: {
      type: String,
      required: false,
    },
    to: {
      type: [String],
      required: true,
    },
    cc: {
      type: [String],
      required: false,
    },
    bcc: {
      type: [String],
      required: false,
    },
    labels: {
      type: [String],
      required: false,
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
      type: [{
        content: String,
        name: String,
        contentType: String,
      }],
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
