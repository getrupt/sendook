import mongoose from "mongoose";
import type IInbox from "../../../models/Inbox";

const inboxSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IInbox>("Inbox", inboxSchema);
