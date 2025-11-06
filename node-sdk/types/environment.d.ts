import type { HydratedDocument } from "mongoose";
import type User from "../models/User";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_URL: string;
      API_KEY: string;
    }
  }
}

export {};
