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

export async function getPaymentMethod(paymentMethodId: string) {
  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
  return paymentMethod;
}

export async function getCustomerInvoices({
  customerId,
  limit = 10,
}: {
  customerId: string;
  limit?: number;
}) {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  });
  return invoices;
}

export async function getCurrentMonthInvoice({
  customerId,
  subscriptionId,
}: {
  customerId: string;
  subscriptionId?: string;
}) {
  // First try to get upcoming invoice if we have a subscription
  if (subscriptionId) {
    try {
      const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
        subscription: subscriptionId,
      });
      return upcomingInvoice;
    } catch (error) {
      // If no upcoming invoice, continue to check current month
    }
  }

  // Get current month invoices
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const invoices = await stripe.invoices.list({
    customer: customerId,
    created: {
      gte: Math.floor(startOfMonth.getTime() / 1000),
      lte: Math.floor(endOfMonth.getTime() / 1000),
    },
    limit: 1,
  });

  // If no current month invoice, get the most recent one
  if (invoices.data.length === 0) {
    const recentInvoices = await stripe.invoices.list({
      customer: customerId,
      limit: 1,
    });
    return recentInvoices.data[0] || null;
  }

  return invoices.data[0] || null;
}
