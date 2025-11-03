import mongoose from "mongoose";

export default interface Thread {
  id: string;
  organizationId: mongoose.Types.ObjectId;
  inboxId: mongoose.Types.ObjectId;
  messages: mongoose.Types.Array<mongoose.Types.ObjectId>;
  createdAt: Date | null;
  updatedAt: Date | null;
}
