import mongoose from "mongoose";

export default interface Inbox {
  id: string;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date | null;
  updatedAt: Date | null;
}
