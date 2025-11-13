import { Router } from "express";
import type { Request, Response } from "express";
import { createApiKey, deleteApiKey, getApiKeyByIdAndOrganizationId, getApiKeysByOrganizationId } from "../../../controllers/ApiKeyController";
import { body } from "express-validator";
import { expressValidatorMiddleware } from "../../../middlewares/expressValidatorMiddleware";

const router = Router({ mergeParams: true });

router.get(
  "/",
  async (
    req: Request<{ organizationId: string }, {}, {}, { page?: number; per?: number }>,
    res: Response
  ) => {
    const apiKeys = await getApiKeysByOrganizationId(req.organization._id.toString());
    res.json(apiKeys);
  }
);

router.post(
  "/",
  body("name").isString().notEmpty().trim(),
  expressValidatorMiddleware,
  async (req: Request<{}, {}, { name: string }>, res: Response) => {
    const apiKey = await createApiKey({
      organizationId: req.organization._id.toString(),
      name: req.body.name,
    });
    res.json(apiKey);
  }
);

router.get(
  "/:apiKeyId",
  async (req: Request<{ apiKeyId: string }>, res: Response) => {
    const apiKey = await getApiKeyByIdAndOrganizationId({
      apiKeyId: req.params.apiKeyId,
      organizationId: req.organization._id.toString(),
    });
    res.json(apiKey);
  }
);

router.delete(
  "/:apiKeyId",
  async (req: Request<{ apiKeyId: string }>, res: Response) => {
    const apiKey = await deleteApiKey({ apiKeyId: req.params.apiKeyId, organizationId: req.organization._id.toString() });
    res.json(apiKey);
  }
);

export default router;
