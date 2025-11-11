import mongoose from "mongoose";
import type IThread from "../../../models/Thread";

const threadSchema = new mongoose.Schema(
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
    messages: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Message",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IThread>("Thread", threadSchema);
