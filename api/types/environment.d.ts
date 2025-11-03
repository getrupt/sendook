import type { HydratedDocument } from "mongoose";
import type User from "../models/User";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URI: string;
    }
  }
  namespace Express {
    interface User {
      id: string;
    }
  }
}

export {};
