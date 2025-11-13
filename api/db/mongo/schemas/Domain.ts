import mongoose from "mongoose";
import type IDomain from "../../../models/Domain";

const domainSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    records: {
      type: [mongoose.Schema.Types.Mixed],
      default: [
        {
          type: "MX",
          name: "@",
          value: "inbound-smtp.us-east-2.amazonaws.com",
          status: "pending",
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

domainSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export default mongoose.model<IDomain>("Domain", domainSchema);
