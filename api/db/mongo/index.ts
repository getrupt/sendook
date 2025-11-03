import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connection.on("Connection", () => {
  console.log("MongoDB connected");
});
mongoose.connection.on("open", () => {
  console.log("MongoDB opened");
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB error: ", err);
});

export default function start() {
  console.log("Connecting to MongoDB...");
  return mongoose.connect(process.env.MONGO_URI);
}
