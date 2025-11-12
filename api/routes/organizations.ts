import { Router } from "express";
import apiKeyRouter from "./v1/api_keys";
import inboxesRouter from "./v1/inboxes";
import domainsRouter from "./v1/domains";
import { getOrganizationById } from "../controllers/OrganizationController";
import passport from "passport";

const router = Router();

router.use(
  passport.authenticate("bearer", { session: false }),
  (req, res, next) => {
    next();
  }
);

router.use("/:organizationId", async (req, res, next) => {
  const organization = await getOrganizationById(req.params.organizationId!);
  if (!organization) {
    return res.status(404).json({ error: "Organization not found" });
  }
  req.organization = organization;
  next();
});

router.use("/:organizationId/api_keys", apiKeyRouter);
router.use("/:organizationId/inboxes", inboxesRouter);
router.use("/:organizationId/domains", domainsRouter);

export default router;
