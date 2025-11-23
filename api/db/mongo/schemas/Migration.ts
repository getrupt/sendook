import mongoose from "mongoose";
import IMigration from "../../../models/Migration";

const migrationSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    error: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMigration>("Migration", migrationSchema, "migrations");
