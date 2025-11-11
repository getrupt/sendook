import { Router } from "express";
import passport from "passport";
import type { Request, Response } from "express";
import { body } from "express-validator";
import type { HydratedDocument } from "mongoose";
import type Organization from "../../../models/Organization";
import { expressValidatorMiddleware } from "../../../middlewares/expressValidatorMiddleware";
import {
  createDomain,
  deleteDomainByOrganizationIdAndName,
  getDomainByOrganizationIdAndName,
  getDomainsByOrganizationId,
  verifyDomainDNS,
} from "../../../controllers/DomainController";
import { getDNSMXRecords } from "../../../controllers/DNSController";

const router = Router({ mergeParams: true });

router.get(
  "/",
  passport.authenticate("api_key", { session: false }),
  async (req: Request<{ organizationId: string }, {}, {}>, res: Response) => {
    const organization = req.user as HydratedDocument<Organization>;
    const domains = await getDomainsByOrganizationId({
      organizationId: organization._id.toString(),
    });
    return res.json(domains);
  }
);

router.post(
  "/",
  body("name")
    .isString()
    .trim()
    .notEmpty()
    .matches(/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/)
    .withMessage("Invalid domain name format"),
  expressValidatorMiddleware,
  passport.authenticate("api_key", { session: false }),
  async (
    req: Request<{ organizationId: string }, {}, { name: string }>,
    res: Response
  ) => {
    const organization = req.user as HydratedDocument<Organization>;
    const domain = await createDomain({
      organizationId: organization._id.toString(),
      name: req.body.name,
    });

    return res.json(domain);
  }
);

router.get(
  "/:domainId",
  passport.authenticate("api_key", { session: false }),
  async (
    req: Request<{ organizationId: string; domainId: string }, {}, {}>,
    res: Response
  ) => {
    const organization = req.user as HydratedDocument<Organization>;
    const domain = await getDomainByOrganizationIdAndName({
      organizationId: organization._id.toString(),
      name: req.params.domainId,
    });

    if (!domain) {
      return res.status(404).json({ error: "Domain not found" });
    }
    return res.json(domain);
  }
);

router.post(
  "/:domainId/verify",
  passport.authenticate("api_key", { session: false }),
  async (
    req: Request<{ organizationId: string; domainId: string }, {}, {}>,
    res: Response
  ) => {
    const organization = req.user as HydratedDocument<Organization>;
    const domain = await getDomainByOrganizationIdAndName({
      organizationId: organization._id.toString(),
      name: req.params.domainId,
    });
    if (!domain) {
      return res.status(404).json({ error: "Domain not found" });
    }

    const { domain: verifiedDomain } = await verifyDomainDNS({ domain });

    return res.json(verifiedDomain);
  }
);

router.delete(
  "/:domainId",
  passport.authenticate("api_key", { session: false }),
  async (
    req: Request<{ organizationId: string; domainId: string }, {}, {}>,
    res: Response
  ) => {
    const organization = req.user as HydratedDocument<Organization>;
    const deletedDomain = await deleteDomainByOrganizationIdAndName({
      organizationId: organization._id.toString(),
      name: req.params.domainId,
    });
    if (!deletedDomain) {
      return res.status(404).json({ error: "Domain not found" });
    }

    return res.json(deletedDomain);
  }
);

export default router;
