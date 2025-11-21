import type { HydratedDocument } from "mongoose";
import type User from "../models/User";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URI: string;
      RUPT_SECRET_KEY: string;
      DEFAULT_EMAIL_DOMAIN: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      MESSAGE_LIMIT: string;
    }
  }
  namespace Express {
    interface User {
      id: string;
    }
    interface Request {
      organization: HydratedDocument<Organization>;
    }
  }
}

export {};
