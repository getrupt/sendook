import mongoose from "mongoose";
import type IInbox from "../../../models/Inbox";

const inboxSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    domainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain",
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

inboxSchema.index({ email: 1 }, { unique: true });

export default mongoose.model<IInbox>("Inbox", inboxSchema);
