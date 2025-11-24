import Organization from "../db/mongo/schemas/Organization";
import User from "../db/mongo/schemas/User";
import { createStripeCustomer, createStripeSubscription } from "../controllers/StripeController";

export async function runMigration() {
  console.log("Starting migration: Hydrate Stripe Customers");

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }

  if (!process.env.STRIPE_PRICE_ID) {
    throw new Error("STRIPE_PRICE_ID environment variable is not set");
  }

  try {
    const organizationsWithoutStripe = await Organization.find({
      $or: [
        { stripeCustomerId: { $exists: false } },
        { stripeCustomerId: null },
        { stripeCustomerId: "" },
        { stripeSubscriptionId: { $exists: false } },
        { stripeSubscriptionId: null },
        { stripeSubscriptionId: "" },
      ],
    }).populate("users");

    console.log(`Found ${organizationsWithoutStripe.length} organizations without Stripe customers`);

    if (organizationsWithoutStripe.length === 0) {
      console.log("No organizations need Stripe customer creation. Migration complete.");
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ organizationId: string; error: string }> = [];

    for (const org of organizationsWithoutStripe) {
      try {
        console.log(`Processing organization: ${org._id} (${org.name})`);

        let customerId = org.stripeCustomerId;
        let subscriptionId = org.stripeSubscriptionId;

        if (!customerId || customerId === "") {
          const userId = org.users[0];
          if (!userId) {
            throw new Error("Organization has no users");
          }

          const user = await User.findById(userId);
          if (!user) {
            throw new Error(`User ${userId} not found`);
          }

          if (!user.email) {
            throw new Error(`User ${userId} has no email`);
          }

          console.log(`Creating Stripe customer for organization ${org.name} with email ${user.email}`);
          const customer = await createStripeCustomer({
            name: org.name,
            email: user.email,
          });
          customerId = customer.id;

          console.log(`Creating Stripe subscription for customer ${customer.id}`);
          const subscription = await createStripeSubscription({
            customerId: customer.id,
            priceId: process.env.STRIPE_PRICE_ID,
          });
          subscriptionId = subscription.id;

          org.stripeCustomerId = customerId;
          org.stripeSubscriptionId = subscriptionId;
          await org.save();

          console.log(`✓ Successfully created Stripe customer and subscription for organization ${org.name}`);
        } else if (!subscriptionId || subscriptionId === "") {
          console.log(`Organization has customer ${customerId} but no subscription. Creating subscription...`);
          const subscription = await createStripeSubscription({
            customerId: customerId,
            priceId: process.env.STRIPE_PRICE_ID,
          });
          subscriptionId = subscription.id;

          org.stripeSubscriptionId = subscriptionId;
          await org.save();

          console.log(`✓ Successfully created Stripe subscription for organization ${org.name}`);
        }

        successCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`✗ Error processing organization ${org._id}:`, errorMessage);
        errors.push({
          organizationId: org._id.toString(),
          error: errorMessage,
        });
        errorCount++;
      }
    }

    console.log("\n=== Migration Summary ===");
    console.log(`Total organizations processed: ${organizationsWithoutStripe.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

    if (errors.length > 0) {
      console.log("\n=== Errors ===");
      errors.forEach(({ organizationId, error }) => {
        console.log(`Organization ${organizationId}: ${error}`);
      });
    }

    console.log("\nMigration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

