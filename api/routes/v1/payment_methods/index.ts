import { Router } from "express";
import type { Request, Response } from "express";
import { 
  createSetupIntent, 
  attachPaymentMethod, 
  getPaymentMethod,
  getCurrentMonthInvoice 
} from "../../../controllers/StripeController";
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

router.get(
  "/",
  async (req: Request<{ organizationId: string }, {}, {}>, res: Response) => {
    try {
      const organization = req.organization;
      if (!organization.stripePaymentMethodId) {
        return res.json({ paymentMethod: null });
      }

      const paymentMethod = await getPaymentMethod(organization.stripePaymentMethodId);
      return res.json({ paymentMethod });
    } catch (error) {
      console.error("Error getting payment method:", error);
      return res.status(500).json({ error: "Failed to get payment method" });
    }
  }
);

router.get(
  "/invoice/current",
  async (req: Request<{ organizationId: string }, {}, {}>, res: Response) => {
    try {
      const organization = req.organization;
      if (!organization.stripeCustomerId) {
        return res.status(400).json({ error: "Organization does not have a Stripe customer ID" });
      }

      const invoice = await getCurrentMonthInvoice({
        customerId: organization.stripeCustomerId,
        subscriptionId: organization.stripeSubscriptionId,
      });

      return res.json({ invoice });
    } catch (error) {
      console.error("Error getting current month invoice:", error);
      return res.status(500).json({ error: "Failed to get invoice" });
    }
  }
);

export default router;

