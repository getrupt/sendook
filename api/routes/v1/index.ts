import { Router } from "express";
import inboxesRouter from "./inboxes";
import domainsRouter from "./domains";
import passport from "passport";
import type { HydratedDocument } from "mongoose";
import type Organization from "../../models/Organization";
import apiKeyRouter from "./api_keys";

const router = Router({ mergeParams: true });

router.use(
  passport.authenticate("api_key", { session: false }),
  (req, res, next) => {
    req.organization = req.user as HydratedDocument<Organization>;
    next();
  }
);

router.use("/api_keys", apiKeyRouter);
router.use("/inboxes", inboxesRouter);
router.use("/domains", domainsRouter);

export default router;