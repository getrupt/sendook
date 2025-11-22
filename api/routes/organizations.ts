import { Router } from "express";
import apiKeyRouter from "./v1/api_keys";
import inboxesRouter from "./v1/inboxes";
import domainsRouter from "./v1/domains";
import passport from "passport";
import webhooksRouter from "./v1/webhooks";
import statsRouter from "./v1/stats";
import paymentMethodsRouter from "./v1/payment_methods";
import { getOrganizationById } from "../controllers/OrganizationController";

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
router.use("/:organizationId/webhooks", webhooksRouter);
router.use("/:organizationId/stats", statsRouter);
router.use("/:organizationId/payment_methods", paymentMethodsRouter);

export default router;
