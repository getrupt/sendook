import Organization from "../db/mongo/schemas/Organization";
import type User from "../models/User";
import { createStripeCustomer, createStripeSubscription } from "./StripeController";

export async function createOrganization({
  name,
  user,
}: {
  name: string;
  user: User;
}) {
  const customer = await createStripeCustomer({
    name,
    email: user.email,
  });

  if (!process.env.STRIPE_PRICE_ID) {
    throw new Error("STRIPE_PRICE_ID is not set");
  }

  const subscription = await createStripeSubscription({
    customerId: customer.id,
    priceId: process.env.STRIPE_PRICE_ID,
  });

  const organization = new Organization();
  organization.name = name;
  organization.stripeCustomerId = customer.id;
  organization.stripeSubscriptionId = subscription.id;
  organization.users.addToSet(user.id);
  await organization.save();

  return { organization };
}

export async function getOrganizationsByUserId(userId: string) {
  return await Organization.find({ users: userId });
}

export async function getOrganizationById(organizationId: string) {
  return await Organization.findById(organizationId);
}

export async function getOrganizationByStripeCustomerId(stripeCustomerId: string) {
  return await Organization.findOne({ stripeCustomerId });
}

export async function updateOrganization(organizationId: string, data: any) {
  return await Organization.findByIdAndUpdate(organizationId, data);
}
