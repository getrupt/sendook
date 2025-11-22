import { raw, type Request, type Response } from "express";
import Stripe from "stripe";
import { getOrganizationByStripeCustomerId, updateOrganization } from "../../controllers/OrganizationController";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);

import { Router } from "express";

const router = Router();

router.post("/", 
  raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const payload = req.body;
    const sig = req.headers["stripe-signature"];
    let event;

    if (!sig) {
      res.status(400).send("No signature");
      return;
    }

    try {
      event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err}`);
      return;
    }

    if (event.type === "payment_method.attached") {
      try {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        const organization = await getOrganizationByStripeCustomerId(paymentMethod.customer as string);
        if (!organization) {
          res.status(404).send("Project not found");
          return;
        }
        await updateOrganization(organization.id, { stripePaymentMethodId: paymentMethod.id });
      } catch (err) {
        console.error("Error processing payment method attached event", err);
        return res.status(500).send("Error processing payment method attached event");
      }
    }

    res.status(200).send();
  },
);

export default router;
