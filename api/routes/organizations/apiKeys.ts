import { Router } from "express";
import passport from "passport";
import type { Request, Response } from "express";
import { getOrganizationById } from "../../controllers/OrganizationController";
import { getApiKeysByOrganizationId } from "../../controllers/ApiKeyController";

const router = Router({ mergeParams: true });

router.get(
  "/",
  passport.authenticate("bearer", { session: false }),
  async (
    req: Request<{ organizationId: string }, {}, {}, { page?: number; per?: number }>,
    res: Response
  ) => {
    const organization = await getOrganizationById(req.params.organizationId!);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    const apiKeys = await getApiKeysByOrganizationId(req.params.organizationId!);
    res.json(apiKeys);
  }
);

export default router;
