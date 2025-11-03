import type mongoose from "mongoose";

export default interface AccessToken {
  id: string;
  token: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date | null;
  updatedAt: Date | null;
}
