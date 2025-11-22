import mongoose from "mongoose";

export default interface Usage {
  id: string;
  organizationId: mongoose.Types.ObjectId;
  count: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date | null;
  updatedAt: Date | null;
}
