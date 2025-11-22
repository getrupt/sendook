<template>
  <DashboardShell>
    <template #header>
      <div class="page-heading">
        <div>
          <h1>Billing</h1>
          <p>Manage your payment method and view invoice details.</p>
        </div>
      </div>
    </template>

    <section v-if="loading" class="placeholder-card">
      <h2>Loading billing information…</h2>
      <p>We are fetching your payment method and invoice details.</p>
    </section>

    <template v-else>
      <div v-if="errorMessage" class="banner banner-error" role="alert">
        {{ errorMessage }}
      </div>

      <div class="billing-grid">
        <!-- Payment Method Card -->
        <div class="billing-card">
          <header class="billing-card-header">
            <h2>Payment Method</h2>
            <button
              v-if="paymentMethod"
              type="button"
              class="button-secondary"
              @click="openUpdateDialog"
            >
              Update
            </button>
            <button
              v-else
              type="button"
              class="button-primary"
              @click="openUpdateDialog"
            >
              Add Payment Method
            </button>
          </header>

          <div v-if="paymentMethod" class="payment-method-info">
            <div class="payment-method-card">
              <div class="card-icon">
                <UIcon
                  v-if="paymentMethod.card?.brand === 'visa'"
                  name="i-heroicons-credit-card-20-solid"
                  size="24"
                />
                <UIcon
                  v-else-if="paymentMethod.card?.brand === 'mastercard'"
                  name="i-heroicons-credit-card-20-solid"
                  size="24"
                />
                <UIcon
                  v-else
                  name="i-heroicons-credit-card-20-solid"
                  size="24"
                />
              </div>
              <div class="card-details">
                <p class="card-brand">
                  {{ formatCardBrand(paymentMethod.card?.brand) }}
                  •••• {{ paymentMethod.card?.last4 }}
                </p>
                <p class="card-expiry">
                  Expires {{ paymentMethod.card?.exp_month }}/{{ paymentMethod.card?.exp_year }}
                </p>
              </div>
            </div>
            <div v-if="paymentMethod.billing_details" class="billing-address">
              <p class="address-label">Billing Address</p>
              <p class="address-text">
                {{ paymentMethod.billing_details.name }}<br>
                <template v-if="paymentMethod.billing_details.address">
                  {{ paymentMethod.billing_details.address.line1 }}<br>
                  <template v-if="paymentMethod.billing_details.address.line2">
                    {{ paymentMethod.billing_details.address.line2 }}<br>
                  </template>
                  {{ paymentMethod.billing_details.address.city }},
                  {{ paymentMethod.billing_details.address.state }}
                  {{ paymentMethod.billing_details.address.postal_code }}<br>
                  {{ paymentMethod.billing_details.address.country }}
                </template>
              </p>
            </div>
          </div>

          <div v-else class="no-payment-method">
            <p>No payment method on file.</p>
            <p class="muted">Add a payment method to continue using Sendook.</p>
          </div>
        </div>

        <!-- Current Month Invoice -->
        <div class="billing-card">
          <header class="billing-card-header">
            <h2>Current Month Invoice</h2>
          </header>

          <div v-if="invoice" class="invoice-info">
            <div class="invoice-row">
              <span class="invoice-label">Status</span>
              <span :class="['invoice-status', `status-${invoice.status}`]">
                {{ formatInvoiceStatus(invoice.status) }}
              </span>
            </div>
            <div class="invoice-row">
              <span class="invoice-label">Amount</span>
              <span class="invoice-amount">
                {{ formatCurrency(invoice.amount_due / 100, invoice.currency) }}
              </span>
            </div>
            <div class="invoice-row">
              <span class="invoice-label">Period</span>
              <span class="invoice-period">
                {{ formatDate(invoice.period_start) }} - {{ formatDate(invoice.period_end) }}
              </span>
            </div>
            <div v-if="invoice.hosted_invoice_url" class="invoice-actions">
              <a
                :href="invoice.hosted_invoice_url"
                target="_blank"
                rel="noopener noreferrer"
                class="button-secondary"
              >
                View Invoice
              </a>
            </div>
          </div>

          <div v-else class="no-invoice">
            <p>No invoice for the current month.</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Update Payment Method Dialog -->
    <Transition name="fade">
      <div v-if="showUpdateDialog" class="dialog-backdrop" role="dialog" aria-modal="true" @click.self="closeUpdateDialog">
        <div class="dialog-card">
          <header class="dialog-header">
            <h2>{{ paymentMethod ? 'Update Payment Method' : 'Add Payment Method' }}</h2>
            <button type="button" class="icon-close" aria-label="Close" @click="closeUpdateDialog">
              ×
            </button>
          </header>
          <form class="dialog-form" @submit.prevent="handleSubmitPayment">
            <div>
              <label class="form-label">Card Information</label>
              <div id="card-element-update" class="stripe-element-container">
                <!-- Stripe Elements will mount here -->
              </div>
              <div id="card-errors-update" role="alert" class="stripe-errors"></div>
            </div>
            
            <div>
              <label class="form-label">Billing Address</label>
              <div id="address-element-update" class="stripe-element-container">
                <!-- Stripe Address Element will mount here -->
              </div>
            </div>
            
            <p v-if="updateErrorMessage" class="dialog-error" role="alert">{{ updateErrorMessage }}</p>

            <footer>
              <button type="button" class="button-secondary" :disabled="processing" @click="closeUpdateDialog">
                Cancel
              </button>
              <button type="submit" class="button-primary" :disabled="processing">
                <span v-if="processing">Processing…</span>
                <span v-else>{{ paymentMethod ? 'Update' : 'Add' }} Payment Method</span>
              </button>
            </footer>
          </form>
        </div>
      </div>
    </Transition>
  </DashboardShell>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { loadStripe, type Stripe, type StripeElements, type StripeCardElement, type StripeAddressElement } from "@stripe/stripe-js";

defineOptions({
  name: 'BillingPage'
});

const session = useRequireAuth();

const loading = ref(true);
const errorMessage = ref("");
const paymentMethod = ref<any>(null);
const invoice = ref<any>(null);

const showUpdateDialog = ref(false);
const processing = ref(false);
const updateErrorMessage = ref("");
const stripe = ref<Stripe | null>(null);
const elements = ref<StripeElements | null>(null);
const cardElement = ref<StripeCardElement | null>(null);
const addressElement = ref<StripeAddressElement | null>(null);
const clientSecret = ref<string | null>(null);

const getApiUrl = () => {
  const config = useRuntimeConfig();
  return config.public.apiUrl;
};

const formatCardBrand = (brand: string | undefined) => {
  if (!brand) return "Card";
  return brand.charAt(0).toUpperCase() + brand.slice(1);
};

const formatInvoiceStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: "Draft",
    open: "Open",
    paid: "Paid",
    uncollectible: "Uncollectible",
    void: "Void",
  };
  return statusMap[status] || status;
};

const formatCurrency = (amount: number, currency: string = "usd") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
};

const formatDate = (date: number | string | Date | null | undefined) => {
  if (!date) return "N/A";
  const d = typeof date === "number" ? new Date(date * 1000) : new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const fetchBillingData = async () => {
  if (!session.organizationId.value || !session.token.value) {
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    const organizationId = session.organizationId.value;
    const token = session.token.value;

    const [paymentMethodResponse, invoiceResponse] = await Promise.all([
      fetch(`${getApiUrl()}/organizations/${organizationId}/payment_methods`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
      fetch(`${getApiUrl()}/organizations/${organizationId}/payment_methods/invoice/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    ]);

    if (!paymentMethodResponse.ok) {
      throw new Error("Failed to load payment method");
    }

    const paymentMethodData = await paymentMethodResponse.json();
    paymentMethod.value = paymentMethodData.paymentMethod;

    if (invoiceResponse.ok) {
      const invoiceData = await invoiceResponse.json();
      invoice.value = invoiceData.invoice;
    }
  } catch (error) {
    console.error("Error fetching billing data:", error);
    errorMessage.value = error instanceof Error ? error.message : "Failed to load billing information";
  } finally {
    loading.value = false;
  }
};

const initializeStripe = async () => {
  if (typeof window === "undefined") return;
  
  const config = useRuntimeConfig();
  const publishableKey = config.public.stripePublishableKey as string | undefined;
  
  if (!publishableKey) {
    console.error("Stripe publishable key not configured");
    return;
  }

  const stripeInstance = await loadStripe(publishableKey);
  if (!stripeInstance) {
    console.error("Failed to load Stripe");
    return;
  }

  stripe.value = stripeInstance;
};

const setupCardElement = async () => {
  if (!stripe.value || !session.organizationId.value) return;

  const organizationId = session.organizationId.value;
  const token = session.token.value;

  try {
    const response = await fetch(
      `${getApiUrl()}/organizations/${organizationId}/payment_methods/setup-intent`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create setup intent");
    }

    const data = await response.json() as { clientSecret?: string };
    const secret = data.clientSecret;

    if (!secret) {
      throw new Error("No client secret received");
    }

    clientSecret.value = secret;
    elements.value = stripe.value.elements({ 
      clientSecret: secret,
      appearance: {
        theme: "night",
        variables: {
          colorPrimary: "#ffc301",
          colorBackground: "rgba(10, 10, 16, 0.92)",
          colorText: "#ffffff",
          colorDanger: "#fecaca",
          fontFamily: 'system-ui, -apple-system, sans-serif',
          spacingUnit: "4px",
          borderRadius: "0.5rem",
        },
      },
    });
    
    cardElement.value = elements.value.create("card", {
      style: {
        base: {
          color: "#ffffff",
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: "16px",
          "::placeholder": {
            color: "rgba(255, 255, 255, 0.5)",
          },
        },
        invalid: {
          color: "#fecaca",
        },
      },
    });

    addressElement.value = elements.value.create("address", {
      mode: "billing",
      fields: {
        phone: "always",
      },
      validation: {
        phone: {
          required: "never",
        },
      },
      display: {
        name: "full",
      },
    });

    await nextTick();
    const cardElementContainer = document.getElementById("card-element-update");
    if (cardElementContainer && cardElement.value) {
      cardElement.value.mount(cardElementContainer);
    }

    const addressElementContainer = document.getElementById("address-element-update");
    if (addressElementContainer && addressElement.value) {
      addressElement.value.mount(addressElementContainer);
    }
  } catch (error) {
    console.error("Error setting up card element:", error);
    updateErrorMessage.value = "Failed to initialize payment form. Please try again.";
  }
};

const openUpdateDialog = async () => {
  showUpdateDialog.value = true;
  updateErrorMessage.value = "";
  
  if (!stripe.value) {
    await initializeStripe();
  }
  
  await nextTick();
  await setupCardElement();
};

const closeUpdateDialog = () => {
  if (cardElement.value) {
    cardElement.value.unmount();
    cardElement.value = null;
  }
  if (addressElement.value) {
    addressElement.value.unmount();
    addressElement.value = null;
  }
  if (elements.value) {
    elements.value = null;
  }
  clientSecret.value = null;
  showUpdateDialog.value = false;
  updateErrorMessage.value = "";
  processing.value = false;
};

const handleSubmitPayment = async () => {
  if (!stripe.value || !cardElement.value || !addressElement.value || !session.organizationId.value) {
    updateErrorMessage.value = "Payment form not ready. Please try again.";
    return;
  }

  processing.value = true;
  updateErrorMessage.value = "";

  try {
    const organizationId = session.organizationId.value;
    const token = session.token.value;

    if (!clientSecret.value) {
      updateErrorMessage.value = "Payment form not ready. Please try again.";
      processing.value = false;
      return;
    }

    const addressResult = await addressElement.value.getValue();
    
    if (!addressResult.complete) {
      updateErrorMessage.value = "Please complete the billing address form.";
      processing.value = false;
      return;
    }

    const { error: confirmError, setupIntent } = await stripe.value.confirmCardSetup(
      clientSecret.value,
      {
        payment_method: {
          card: cardElement.value,
          billing_details: {
            name: addressResult.value.name,
            email: session.user.value?.email,
            phone: addressResult.value.phone,
            address: {
              line1: addressResult.value.address.line1,
              line2: addressResult.value.address.line2 || undefined,
              city: addressResult.value.address.city,
              state: addressResult.value.address.state,
              postal_code: addressResult.value.address.postal_code,
              country: addressResult.value.address.country,
            },
          },
        },
      }
    );

    if (confirmError) {
      const errorContainer = document.getElementById("card-errors-update");
      if (errorContainer) {
        errorContainer.textContent = confirmError.message || "An error occurred";
      }
      updateErrorMessage.value = confirmError.message || "Failed to confirm payment method";
      processing.value = false;
      return;
    }

    if (!setupIntent?.payment_method) {
      updateErrorMessage.value = "No payment method was created";
      processing.value = false;
      return;
    }

    const attachResponse = await fetch(
      `${getApiUrl()}/organizations/${organizationId}/payment_methods/attach`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId: setupIntent.payment_method,
        }),
      }
    );

    if (!attachResponse.ok) {
      const errorData = await attachResponse.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to attach payment method");
    }

    await session.refreshUser();
    await fetchBillingData();
    closeUpdateDialog();
  } catch (error) {
    console.error("Error submitting payment method:", error);
    updateErrorMessage.value = error instanceof Error ? error.message : "Failed to add payment method";
    processing.value = false;
  }
};

onMounted(async () => {
  useRequireAuth();
  await fetchBillingData();
  if (typeof window !== "undefined") {
    initializeStripe();
  }
});

onUnmounted(() => {
  if (cardElement.value) {
    cardElement.value.unmount();
  }
  if (addressElement.value) {
    addressElement.value.unmount();
  }
});
</script>

<style scoped>
.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.page-heading h1 {
  font-size: 2.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  margin-top: 0;
}

.page-heading p {
  color: rgba(255, 255, 255, 0.6);
  max-width: 520px;
  line-height: 1.5;
}

.banner {
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.banner-error {
  background: rgba(248, 113, 113, 0.16);
  border: 1px solid rgba(248, 113, 113, 0.36);
  color: #fecaca;
}

.placeholder-card {
  text-align: left;
  padding: 3rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(12, 12, 18, 0.5);
  display: grid;
  gap: 1rem;
}

.placeholder-card h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

.placeholder-card p {
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
}

.billing-grid {
  display: grid;
  gap: 1.5rem;
}

.billing-card {
  background: rgba(12, 12, 18, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 2rem;
  display: grid;
  gap: 1.5rem;
}

.billing-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.billing-card-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.payment-method-info {
  display: grid;
  gap: 1.5rem;
}

.payment-method-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.75rem;
}

.card-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 195, 1, 0.16);
  border-radius: 0.5rem;
  color: #ffc301;
}

.card-details {
  flex: 1;
}

.card-brand {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
}

.card-expiry {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.billing-address {
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.address-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem;
  font-weight: 600;
}

.address-text {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
}

.no-payment-method,
.no-invoice {
  padding: 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

.muted {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.invoice-info {
  display: grid;
  gap: 1rem;
}

.invoice-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.invoice-row:last-of-type {
  border-bottom: none;
}

.invoice-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.invoice-status {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
}

.status-paid {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.status-open {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.status-draft {
  background: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
}

.invoice-amount {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffc301;
}

.invoice-period {
  color: rgba(255, 255, 255, 0.8);
}

.invoice-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.button-primary {
  border: none;
  border-radius: 0.4rem;
  padding: 0.75rem 1.2rem;
  background: linear-gradient(135deg, #ffd154 0%, #ffc301 100%);
  color: #000;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.button-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.button-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-secondary {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  border-radius: 0.4rem;
  padding: 0.75rem 1.2rem;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: background 0.2s ease, color 0.2s ease;
}

.button-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.button-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(3, 3, 7, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 30;
}

.dialog-card {
  width: min(500px, 100%);
  background: rgba(10, 10, 16, 0.92);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.45);
  padding: 2rem;
  display: grid;
  gap: 1.5rem;
  max-height: 90vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.icon-close {
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s ease;
}

.icon-close:hover {
  color: rgba(255, 255, 255, 0.9);
}

.dialog-form {
  display: grid;
  gap: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.78);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.stripe-element-container {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.5rem;
  padding: 0.85rem 1rem;
  transition: border-color 0.2s ease;
  /* min-height: 48px; */
}

.stripe-element-container:focus-within {
  border-color: rgba(99, 102, 241, 0.55);
}

.stripe-errors {
  color: #fecaca;
  font-size: 0.9rem;
  min-height: 1.2rem;
}

.dialog-error {
  border-radius: 0.5rem;
  padding: 0.85rem 1rem;
  background: rgba(248, 113, 113, 0.16);
  border: 1px solid rgba(248, 113, 113, 0.36);
  color: #fecaca;
  font-size: 0.9rem;
}

.dialog-form footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 780px) {
  .page-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .billing-grid {
    grid-template-columns: 1fr;
  }
}
</style>

