import { Router } from "express";
import passport from "passport";
import type { Request, Response } from "express";
import { getOrganizationById } from "../../controllers/OrganizationController.js";
import { createInbox, getNewRandomInboxEmail } from "../../controllers/InboxController.js";
import { body } from "express-validator";
import { expressValidatorMiddleware } from "../../middlewares/expressValidatorMiddleware.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  body("name").isString().notEmpty().trim(),
  expressValidatorMiddleware,
  passport.authenticate("api_key", { session: false }),
  async (
    req: Request<{ organizationId: string }, {}, { name: string }>,
    res: Response
  ) => {
    try {
      const organization = await getOrganizationById(req.params.organizationId!);
      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }

      const inbox = await createInbox({
        organization_id: req.params.organizationId!,
        name: req.body.name,
        email: await getNewRandomInboxEmail({ name: req.body.name }),
      });
      return res.status(201).json(inbox);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create inbox" });
    }
  }
);

export default router;
