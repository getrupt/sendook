import mongoose from "mongoose";

export default interface Migration {
  id: string;
  filename: string;
  path: string;
  status: string;
  error: string;
  createdAt: Date;
  updatedAt: Date;
}
