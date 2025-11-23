import express, { json, text, urlencoded } from "express";
import cookieParser from "cookie-parser";
import startMongo from "./db/mongo";
import passport from "passport";
import { passportBearerStrategy, passportApiKeyStrategy } from "./controllers/PassportController";
import cors from "cors";
import authRouter from "./routes/auth";
import organizationsRouter from "./routes/organizations";
import webhooksRouter from "./routes/webhooks";
import v1Router from "./routes/v1/index";
import runMigrations from "./migrations";

const app = express();
const port = process.env.PORT || 8006;

startMongo().then(async () => {
  console.log("MongoDB connected, running migrations...");
  try {
    await runMigrations();
  } catch (error) {
    console.error("Error running migrations:", error);
  }
  
  app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
  });
}).catch((error) => {
  console.error("Failed to start MongoDB:", error);
  process.exit(1);
});

app.use((req, res, next) => {
  if (
    req.originalUrl === "/webhook/stripe" ||
    req.originalUrl === "/webhook/resend"
  ) {
    next();
  } else {
    json({ limit: "20mb" })(req, res, next);
  }
});

app.use(text());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

passport.use("bearer", passportBearerStrategy);
passport.use("api_key", passportApiKeyStrategy);

app.use((req, res, next) => {
  if (req.originalUrl === "/webhook/stripe") {
    next();
  } else {
    json()(req, res, next);
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ healthy: true, environment: process.env.ENV });
});

app.use("/auth", authRouter);
app.use("/organizations", organizationsRouter);
app.use("/webhooks", webhooksRouter);
app.use("/v1", v1Router);
