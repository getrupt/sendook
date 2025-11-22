import { Router } from "express";
import type { Request, Response } from "express";
import { createSetupIntent, attachPaymentMethod } from "../../../controllers/StripeController";
import { updateOrganization } from "../../../controllers/OrganizationController";

const router = Router({ mergeParams: true });

router.post(
  "/setup-intent",
  async (req: Request<{ organizationId: string }, {}, {}>, res: Response) => {
    try {
      const organization = req.organization;
      if (!organization.stripeCustomerId) {
        return res.status(400).json({ error: "Organization does not have a Stripe customer ID" });
      }

      const setupIntent = await createSetupIntent({
        customerId: organization.stripeCustomerId,
      });

      return res.json({ clientSecret: setupIntent.client_secret });
    } catch (error) {
      console.error("Error creating setup intent:", error);
      return res.status(500).json({ error: "Failed to create setup intent" });
    }
  }
);

router.post(
  "/attach",
  async (
    req: Request<{ organizationId: string }, {}, { paymentMethodId: string }>,
    res: Response
  ) => {
    try {
      const organization = req.organization;
      if (!organization.stripeCustomerId) {
        return res.status(400).json({ error: "Organization does not have a Stripe customer ID" });
      }

      const { paymentMethodId } = req.body;
      if (!paymentMethodId) {
        return res.status(400).json({ error: "paymentMethodId is required" });
      }

      await attachPaymentMethod({
        paymentMethodId,
        customerId: organization.stripeCustomerId,
      });

      // Update organization with payment method ID
      // The webhook will also handle this, but we can do it immediately for better UX
      await updateOrganization(organization._id.toString(), {
        stripePaymentMethodId: paymentMethodId,
      });

      return res.json({ success: true });
    } catch (error) {
      console.error("Error attaching payment method:", error);
      return res.status(500).json({ error: "Failed to attach payment method" });
    }
  }
);

export default router;

