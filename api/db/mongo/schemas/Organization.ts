import mongoose from "mongoose";
import type IOrganization from "../../../models/Organization";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    users: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      required: true,
    },
    stripePaymentMethodId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrganization>("Organization", organizationSchema);
