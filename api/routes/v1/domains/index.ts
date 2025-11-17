import { Router } from "express";
import type { Request, Response } from "express";
import { body } from "express-validator";
import { expressValidatorMiddleware } from "../../../middlewares/expressValidatorMiddleware";
import {
  createDomain,
  deleteDomainByOrganizationIdAndName,
  getDomainByOrganizationIdAndName,
  getDomainsByOrganizationId,
  verifyDomainDNS,
} from "../../../controllers/DomainController";
import {
  getDomainVerificationDkimAttributes,
  getDomainVerificationStatus,
} from "../../../controllers/SESController";

const router = Router({ mergeParams: true });

router.get(
  "/",
  async (req: Request<{ organizationId: string }, {}, {}>, res: Response) => {
    const domains = await getDomainsByOrganizationId({
      organizationId: req.organization._id.toString(),
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
    .matches(
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    )
    .withMessage("Invalid domain name format"),
  expressValidatorMiddleware,
  async (
    req: Request<{ organizationId: string }, {}, { name: string }>,
    res: Response
  ) => {
    const domain = await createDomain({
      organizationId: req.organization._id.toString(),
      name: req.body.name,
    });

    return res.json(domain);
  }
);

router.get(
  "/:domainId",
  async (
    req: Request<{ organizationId: string; domainId: string }, {}, {}>,
    res: Response
  ) => {
    const domain = await getDomainByOrganizationIdAndName({
      organizationId: req.organization._id.toString(),
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
  async (
    req: Request<{ organizationId: string; domainId: string }, {}, {}>,
    res: Response
  ) => {
    const domain = await getDomainByOrganizationIdAndName({
      organizationId: req.organization._id.toString(),
      name: req.params.domainId,
    });
    if (!domain) {
      return res.status(404).json({ error: "Domain not found" });
    }

    const { domain: verifiedDomain } = await verifyDomainDNS({ domain });

    return res.json(verifiedDomain);
  }
);

router.get(
  "/:domainId/dns",
  async (
    req: Request<{ organizationId: string; domainId: string }, {}, {}>,
    res: Response
  ) => {
    const domain = await getDomainByOrganizationIdAndName({
      organizationId: req.organization._id.toString(),
      name: req.params.domainId,
    });
    if (!domain) {
      return res.status(404).json({ error: "Domain not found" });
    }

    const verifiedDomainDkimAttributes =
      await getDomainVerificationDkimAttributes({ domain: domain.name });

    if (!verifiedDomainDkimAttributes.DkimTokens) {
      return res.status(400).json({ error: "Failed to get DKIM attributes" });
    }

    return res.json([
      {
        type: "MX",
        name: "@",
        value: "inbound-smtp.us-east-2.amazonaws.com",
      },
      {
        type: "TXT",
        name: "@",
        value: "v=spf1 include:amazonses.com ~all",
      },
      {
        type: "TXT",
        name: "_dmarc",
        value: "v=DMARC1; p=reject;",
      },
      ...verifiedDomainDkimAttributes.DkimTokens.map((token) => ({
        type: "CNAME",
        name: `${token}_domainkey.${domain.name}`,
        value: `${token}.dkim.amazonses.com`,
      }))
    ]);
  }
);

router.delete(
  "/:domainId",
  async (
    req: Request<{ organizationId: string; domainId: string }, {}, {}>,
    res: Response
  ) => {
    const deletedDomain = await deleteDomainByOrganizationIdAndName({
      organizationId: req.organization._id.toString(),
      name: req.params.domainId,
    });
    if (!deletedDomain) {
      return res.status(404).json({ error: "Domain not found" });
    }

    return res.json(deletedDomain);
  }
);

export default router;
