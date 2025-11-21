import mongoose from "mongoose";

export default interface Inbox {
  id: string;
  organizationId: mongoose.Types.ObjectId;
  domainId?: mongoose.Types.ObjectId;
  name?: string;
  email: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}
