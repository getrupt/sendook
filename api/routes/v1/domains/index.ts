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
  body("name").isString().notEmpty().trim(),
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

    const mxRecords = await getDNSMXRecords({
      domain: domain.name,
    });

    let mxRecordFound;
    if (mxRecords && Array.isArray(mxRecords)) {
      mxRecordFound = domain.records.find(
        (domainRecord) =>
          domainRecord.type === "MX" &&
          mxRecords.find((dnsRecord: any) => {
            return (
              typeof dnsRecord.exchange === "string" &&
              dnsRecord.exchange.toLowerCase() ===
                domainRecord.value.toLowerCase()
            );
          })
      );
    }

    if (mxRecordFound) {
      mxRecordFound.status = "verified";
    }
    domain.verified = mxRecordFound ? true : false;
    await domain.save();

    return res.json(domain);
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
