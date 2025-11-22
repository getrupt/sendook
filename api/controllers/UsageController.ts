import { getStripeSubscription, sendStripeMeterEvent } from "./StripeController";
import { getOrganizationById } from "./OrganizationController";
import Usage from "../db/mongo/schemas/Usage"; 
import mongoose from "mongoose";

export async function createUsage({
  organizationId,
  count = 1,
  periodStart,
  periodEnd,
}: {
  organizationId: string;
  count?: number;
  periodStart: Date;
  periodEnd: Date;
}) {
  const createdUsage = new Usage();
  createdUsage.organizationId = new mongoose.Types.ObjectId(organizationId);
  createdUsage.count = count;
  createdUsage.periodStart = periodStart;
  createdUsage.periodEnd = periodEnd;
  await createdUsage.save();

  return createdUsage;
}

export async function getUsageByOrganizationId({
  organizationId,
  date,
}: {
  organizationId: string;
  date: Date;
}) {
  return await Usage.findOne({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    periodStart: { $lte: date },
    periodEnd: { $gte: date },
  });
}

export async function incrementUsage({
  organizationId,
  date,
  count = 1,
}: {
  organizationId: string;
  date: Date;
  count: number;
}) {
  const organization = await getOrganizationById(organizationId);

  if (!organization) {
    throw new Error("Organization not found");
  }

  const currentPeriodUsage = await getUsageByOrganizationId({
    organizationId,
    date,
  });

  if (!currentPeriodUsage) {
    const subscription = await getStripeSubscription({
      subscriptionId: organization.stripeSubscriptionId,
    });

    return await createUsage({
      organizationId,
      count,
      periodStart: new Date(subscription.current_period_start * 1000),
      periodEnd: new Date(subscription.current_period_end * 1000),
    });
  }

  if (currentPeriodUsage.count >= parseInt(process.env.USAGE_LIMIT!, 10) && !organization.stripePaymentMethodId) {
    throw new Error("Usage limit reached");
  }

  return Usage.findByIdAndUpdate(
    currentPeriodUsage.id,
    { $inc: { count } },
    { new: true }
  );
}

export const chargeUsage = async ({
  organizationId,
  stripeCustomerId,
}: {
  organizationId: string;
  stripeCustomerId: string;
}) => {
  try {
    const usage = await incrementUsage({
      organizationId,
      date: new Date(),
      count: 1,
    });
    if (usage) {
      await sendStripeMeterEvent({
        event: process.env.STRIPE_METER_EVENT!,
        customerId: stripeCustomerId,
        value: 1,
      });
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Usage limit reached"
    ) {
      throw new Error("Usage limit reached");
      return;
    }
    throw error;
  }
};
