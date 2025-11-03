import mongoose from "mongoose";
import type IApiKey from "../../../models/ApiKey";

const apiKeySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IApiKey>("ApiKey", apiKeySchema);
