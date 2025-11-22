import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createStripeCustomer({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const customer = await stripe.customers.create({
    name,
    email,
  });

  return customer;
}

export async function createStripeSubscription({
  customerId,
  priceId,
}: {
  customerId: string;
  priceId: string;
}) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }]
  });

  return subscription;
}

export async function getStripeSubscription({
  subscriptionId,
}: {
  subscriptionId: string;
}) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}

export async function getStripeUpcomingInvoice({
  subscriptionId,
}: {
  subscriptionId: string;
}) {
  const invoice = await stripe.invoices.retrieveUpcoming({ subscription: subscriptionId });
  return invoice;
}

export async function sendStripeMeterEvent({
  event,
  customerId,
  value = 1,
}: {
  event: string;
  customerId: string;
  value: number;
}) {
  const meterEvent = await stripe.billing.meterEvents.create({
    event_name: event,
    timestamp: Math.floor(Date.now() / 1000),
    payload: {
      stripe_customer_id: customerId,
      value: value.toString(),
    },
  });
  return meterEvent;
}

export async function createSetupIntent({
  customerId,
}: {
  customerId: string;
}) {
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
  });
  return setupIntent;
}

export async function attachPaymentMethod({
  paymentMethodId,
  customerId,
}: {
  paymentMethodId: string;
  customerId: string;
}) {
  const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });
  return paymentMethod;
}
