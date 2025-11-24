<template>
  <div class="dashboard-shell">
    <aside class="dashboard-sidebar">
      <div class="sidebar-inner">
        <div class="sidebar-brand">
          <img src="/sendook-logo.svg" alt="Sendook" class="brand-logo" />
        </div>
        <nav>
          <ul>
            <li v-for="link in links" :key="link.to">
              <NuxtLink
                :to="link.to"
                :class="['sidebar-link', { active: isActive(link.to) }]"
              >
                <span>{{ link.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
      <div>
        <div v-if="session.usage.value" class="message-limit">
          <p class="flex flex-row items-center message-limit-label">
            <span v-if="session.usage.value && session.usage.value.count < usageLimit" class="flex-1" >Free usage</span>
            <span v-else class="flex-1" >Message usage</span>
            <button
              v-if="
                !session.user.value?.organizations?.[0]?.stripePaymentMethodId
              "
              class="cc-button"
              @click="handleAddPaymentMethod"
            >
              <UIcon name="i-heroicons-credit-card-20-solid" size="20" />
            </button>
            <NuxtLink v-else to="/billing" class="news-button">
              <UIcon name="i-heroicons-credit-card-20-solid" size="20" />
            </NuxtLink>
          </p>
          <div class="message-limit-progress">
            <div class="progress-bar-container">
              <div
                class="progress-bar-fill"
                :style="{
                  width: `${Math.min(((session.usage.value?.count ?? 0) / usageLimit) * 100, 100)}%`,
                }"
                :class="progressBarClass"
              />
            </div>
            <p class="message-limit-text">
              {{ session.usage.value?.count }}
              {{
                !session.user.value?.organizations?.[0]?.stripePaymentMethodId || (session.usage.value && session.usage.value.count < usageLimit)
                  ? `/ ${usageLimit}`
                  : ""
              }}
            </p>
          </div>
        </div>
        <div v-if="session.user.value" class="user-summary">
          <p class="user-name">{{ userDisplayName }}</p>
          <p v-if="userEmail" class="user-email">{{ userEmail }}</p>
        </div>
        <button class="logout" type="button" @click="handleLogout">
          <span>Log out</span>
        </button>
      </div>
    </aside>
    <section class="dashboard-main">
      <header v-if="$slots.header" class="dashboard-header">
        <slot name="header" />
      </header>
      <div class="dashboard-content">
        <slot />
      </div>
    </section>

    <Transition name="fade">
      <div
        v-if="showPaymentDialog"
        class="dialog-backdrop"
        role="dialog"
        aria-modal="true"
        @click.self="closePaymentDialog"
      >
        <div class="dialog-card">
          <header class="dialog-header">
            <h2>Add Payment Method</h2>
            <button
              type="button"
              class="icon-close"
              aria-label="Close"
              @click="closePaymentDialog"
            >
              ×
            </button>
          </header>
          <form class="dialog-form" @submit.prevent="handleSubmitPayment">
            <div>
              <label class="form-label">Card Information</label>
              <div id="card-element" class="stripe-element-container">
                <!-- Stripe Elements will mount here -->
              </div>
              <div id="card-errors" role="alert" class="stripe-errors"></div>
            </div>

            <div>
              <label class="form-label">Billing Address</label>
              <div id="address-element" class="stripe-element-container">
                <!-- Stripe Address Element will mount here -->
              </div>
            </div>

            <p v-if="errorMessage" class="dialog-error" role="alert">
              {{ errorMessage }}
            </p>

            <footer>
              <button
                type="button"
                class="button-secondary"
                :disabled="processing"
                @click="closePaymentDialog"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="button-primary"
                :disabled="processing"
              >
                <span v-if="processing">Processing…</span>
                <span v-else>Add Payment Method</span>
              </button>
            </footer>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  loadStripe,
  type Stripe,
  type StripeElements,
  type StripeCardElement,
  type StripeAddressElement,
} from "@stripe/stripe-js";

interface NavLink {
  label: string;
  to: string;
}

const links: NavLink[] = [
  { label: "Inboxes", to: "/inboxes" },
  { label: "API Keys", to: "/api-keys" },
  { label: "Domains", to: "/domains" },
  { label: "Webhooks", to: "/webhooks" },
  { label: "Billing", to: "/billing" },
];

const route = useRoute();
const router = useRouter();
const session = useRequireAuth();
const config = useRuntimeConfig();
const usageLimit = Number(config.public.usageLimit) || 100;

const userDisplayName = computed(() => {
  const current = session.user.value;
  if (!current) {
    return "";
  }
  const nameParts = [
    current.firstName as string | undefined,
    current.lastName as string | undefined,
  ].filter((part): part is string => Boolean(part && part.trim().length));

  if (nameParts.length > 0) {
    return nameParts.join(" ");
  }

  return current.email ?? "";
});

const userEmail = computed(() => session.user.value?.email ?? "");

const progressBarClass = computed(() => {
  const percentage = session.messageLimit.value?.percentage || 0;
  if (percentage >= 90) return "progress-danger";
  if (percentage >= 75) return "progress-warning";
  return "progress-normal";
});

const isActive = (target: string) => {
  if (target === "/") {
    return route.path === "/";
  }
  return route.path.startsWith(target);
};

const handleLogout = () => {
  if (typeof document !== "undefined") {
    document.cookie = "sendook_token=; Max-Age=0; path=/; SameSite=Lax";
  }
  router.replace("/login");
};

const showPaymentDialog = ref(false);
const processing = ref(false);
const errorMessage = ref("");
const stripe = ref<Stripe | null>(null);
const elements = ref<StripeElements | null>(null);
const cardElement = ref<StripeCardElement | null>(null);
const addressElement = ref<StripeAddressElement | null>(null);
const clientSecret = ref<string | null>(null);

const getApiUrl = () => {
  const config = useRuntimeConfig();
  return config.public.apiUrl;
};

const initializeStripe = async () => {
  if (typeof window === "undefined") return;

  // You'll need to set STRIPE_PUBLISHABLE_KEY in your environment
  const config = useRuntimeConfig();
  const publishableKey = config.public.stripePublishableKey as
    | string
    | undefined;

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
    // Get setup intent client secret
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

    const data = (await response.json()) as { clientSecret?: string };
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
          fontFamily: "system-ui, -apple-system, sans-serif",
          spacingUnit: "4px",
          borderRadius: "0.5rem",
        },
      },
    });

    // Create card element
    cardElement.value = elements.value.create("card", {
      style: {
        base: {
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
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

    // Create address element for billing address
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
    const cardElementContainer = document.getElementById("card-element");
    if (cardElementContainer && cardElement.value) {
      cardElement.value.mount(cardElementContainer);
    }

    const addressElementContainer = document.getElementById("address-element");
    if (addressElementContainer && addressElement.value) {
      addressElement.value.mount(addressElementContainer);
    }
  } catch (error) {
    console.error("Error setting up card element:", error);
    errorMessage.value = "Failed to initialize payment form. Please try again.";
  }
};

const handleAddPaymentMethod = async () => {
  showPaymentDialog.value = true;
  errorMessage.value = "";

  if (!stripe.value) {
    await initializeStripe();
  }

  await nextTick();
  await setupCardElement();
};

const closePaymentDialog = () => {
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
  showPaymentDialog.value = false;
  errorMessage.value = "";
  processing.value = false;
};

const handleSubmitPayment = async () => {
  if (
    !stripe.value ||
    !cardElement.value ||
    !addressElement.value ||
    !session.organizationId.value
  ) {
    errorMessage.value = "Payment form not ready. Please try again.";
    return;
  }

  processing.value = true;
  errorMessage.value = "";

  try {
    const organizationId = session.organizationId.value;
    const token = session.token.value;

    if (!clientSecret.value) {
      errorMessage.value = "Payment form not ready. Please try again.";
      processing.value = false;
      return;
    }

    // Get billing address from address element
    const addressResult = await addressElement.value.getValue();

    if (!addressResult.complete) {
      errorMessage.value = "Please complete the billing address form.";
      processing.value = false;
      return;
    }

    // Confirm the setup intent with billing address
    const { error: confirmError, setupIntent } =
      await stripe.value.confirmCardSetup(clientSecret.value, {
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
      });

    if (confirmError) {
      const errorContainer = document.getElementById("card-errors");
      if (errorContainer) {
        errorContainer.textContent =
          confirmError.message || "An error occurred";
      }
      errorMessage.value =
        confirmError.message || "Failed to confirm payment method";
      processing.value = false;
      return;
    }

    if (!setupIntent?.payment_method) {
      errorMessage.value = "No payment method was created";
      processing.value = false;
      return;
    }

    // Attach the payment method to the customer
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

    // Refresh user data to get updated payment method
    await session.refreshUser();
    await session.refreshUsage();

    closePaymentDialog();
  } catch (error) {
    console.error("Error submitting payment method:", error);
    errorMessage.value =
      error instanceof Error ? error.message : "Failed to add payment method";
    processing.value = false;
  }
};

onMounted(() => {
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
.dashboard-shell {
  position: relative;
  padding-left: 240px;
}

.dashboard-sidebar {
  padding: 1.5rem 1.5rem;
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  flex-direction: column;
  gap: 1.75rem;
  justify-content: space-between;
  width: 200px;
  height: calc(100vh - 3rem);
  overflow-y: auto;
}

.sidebar-inner {
  display: grid;
  gap: 1.75rem;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.brand-logo {
  width: 150px;
  display: block;
}

.dashboard-sidebar ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.35rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 195, 1, 0);
  text-decoration: none;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.sidebar-link:hover {
  background: rgba(255, 195, 1, 0.16);
  color: #fff;
}

.sidebar-link.active {
  background: rgba(255, 195, 1, 0.26);
  color: #fff;
  border: 1px solid rgba(255, 195, 1, 0.35);
}

.message-limit {
  margin-top: auto;
  padding: 0.6rem 1rem 0.7rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.04);
  display: grid;
  gap: 0.5rem;
}

.message-limit-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-weight: 500;
}

.cc-button {
  margin-right: -0.5rem;
  border: none;
  border-radius: 0.5rem;
  background: rgba(248, 113, 113, 0.14);
  color: #fecaca;
  padding: 0.2rem 0.4rem 0;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.news-button {
  margin-right: -0.5rem;
  border: none;
  background: rgba(255, 195, 1, 0.2);
  color: rgba(255, 255, 255, 0.5);
  border-radius: 0.5rem;
  padding: 0.2rem 0.4rem 0;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.logout:hover {
  background: rgba(248, 113, 113, 0.2);
  color: #fff;
  transform: translateY(-1px);
}

.message-limit-progress {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar-container {
  flex: 1;
  width: 100%;
  height: 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 0.25rem;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 0.25rem;
  transition:
    width 0.3s ease,
    background 0.3s ease;
}

.progress-bar-fill.progress-normal {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.progress-bar-fill.progress-warning {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.progress-bar-fill.progress-danger {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.message-limit-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  text-align: center;
}

.user-summary {
  margin-top: auto;
  padding: 1rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.04);
  margin-top: 1rem;
}

.user-name {
  font-weight: 600;
  margin: 0;
}

.user-email {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0.25rem 0 0 0;
}

.logout {
  margin-top: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background: rgba(248, 113, 113, 0.14);
  color: #fecaca;
  padding: 0.75rem 1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.dashboard-main {
  background: rgba(10, 10, 16, 0.65);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 2.25rem;
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
  min-height: calc(100vh - 7rem);
  margin-top: 1rem;
  margin-right: 1rem;
}

.dashboard-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dashboard-content {
  display: grid;
  gap: 1.75rem;
}

@media (max-width: 1024px) {
  .dashboard-shell {
    grid-template-columns: 1fr;
  }

  .dashboard-sidebar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .dashboard-sidebar ul {
    display: flex;
    flex-wrap: wrap;
  }

  .dashboard-main {
    padding: 1.75rem;
  }
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

.button-secondary {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  border-radius: 0.4rem;
  padding: 0.75rem 1.2rem;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.button-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.button-primary {
  border: none;
  border-radius: 0.4rem;
  padding: 0.75rem 1.2rem;
  background: linear-gradient(135deg, #ffd154 0%, #ffc301 100%);
  color: #000;
  font-weight: 600;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.button-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.button-primary:disabled,
.button-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
