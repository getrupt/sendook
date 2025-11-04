import type { HydratedDocument } from "mongoose";
import type User from "../models/User";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URI: string;
      RUPT_SECRET_KEY: string;
      DEFAULT_EMAIL_DOMAIN: string;
    }
  }
  namespace Express {
    interface User {
      id: string;
    }
  }
}

export {};
