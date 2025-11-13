import mongoose from "mongoose";

export default interface Domain {
  id: string;
  organizationId: mongoose.Types.ObjectId;
  name: string;
  verified: boolean;
  records: {
    type: string;
    value: string;
    status: string;
  }[],
  createdAt: Date | null;
  updatedAt: Date | null;
}
