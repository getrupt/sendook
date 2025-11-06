import mongoose from "mongoose";

export default interface Domain {
  id: string;
  organizationId: mongoose.Types.ObjectId;
  name: string;
  verified: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}
