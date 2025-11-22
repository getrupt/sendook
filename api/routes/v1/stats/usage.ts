import { Router, type Request, type Response } from "express";
import { getUsageByOrganizationId } from "../../../controllers/UsageController";

const router = Router({ mergeParams: true });

router.get("/", async (req: Request, res: Response) => {
  const usage = await getUsageByOrganizationId({
    organizationId: req.organization._id.toString(),
    date: new Date(),
  });

  return res.json(usage);
});

export default router;
