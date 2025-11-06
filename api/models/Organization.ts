import mongoose from "mongoose";

export default interface Organization {
  id: string;
  name: string;
  users: mongoose.Types.Array<mongoose.Types.ObjectId>;
  // stripeCustomerId: string;
  // stripeSubscriptionId: string;
  // stripePaymentMethodId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
