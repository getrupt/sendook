import type mongoose from "mongoose";

export default interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  projects: mongoose.Types.Array<mongoose.Types.ObjectId>;
  createdAt: Date;
  updatedAt: Date;
}
