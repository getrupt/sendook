<script setup lang="ts">
useSeoMeta({
  titleTemplate: "",
  title: "Pricing - Sendook",
  ogTitle: "Pricing - Sendook",
  description: "Simple, transparent pricing. First 100 uses per month are free, then just $0.01 per use.",
  ogDescription: "Simple, transparent pricing. First 100 uses per month are free, then just $0.01 per use.",
});
</script>

<template>
  <div class="pricing-page">
    <UContainer class="py-16 lg:py-24">
      <!-- Header -->
      <div class="text-center mb-16">
        <h1 class="text-5xl font-semibold mb-4">Simple, Transparent Pricing</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Start free, pay only for what you use. No hidden fees, no surprises.
        </p>
      </div>

      <!-- Pricing Card -->
      <div class="max-w-2xl mx-auto">
        <UCard class="pricing-card">
          <div class="text-center mb-8">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-4">
              <span>✓</span>
              <span>No credit card required to start</span>
            </div>
            <h2 class="text-3xl font-semibold mb-2">Pay as you go</h2>
            <p class="text-gray-600">Fair pricing that scales with your usage</p>
          </div>

          <div class="space-y-6">
            <!-- Free Tier -->
            <div class="p-6 bg-gray-50 rounded-lg border-2 border-green-200">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-xl font-semibold mb-1">Free Tier</h3>
                  <p class="text-gray-600 text-sm">Included every month</p>
                </div>
                <div class="text-right">
                  <div class="text-3xl font-bold text-green-600">$0</div>
                  <p class="text-sm text-gray-500">per month</p>
                </div>
              </div>
              <ul class="space-y-2 text-gray-700">
                <li class="flex items-center gap-2">
                  <span class="text-green-600">✓</span>
                  <span><strong>100 uses</strong> per month included</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-green-600">✓</span>
                  <span>All core features</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Email support</span>
                </li>
              </ul>
            </div>

            <!-- Usage-Based Pricing -->
            <div class="p-6 bg-white rounded-lg border border-gray-200">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-xl font-semibold mb-1">Additional Usage</h3>
                  <p class="text-gray-600 text-sm">After your free tier</p>
                </div>
                <div class="text-right">
                  <div class="text-3xl font-bold">$0.01</div>
                  <p class="text-sm text-gray-500">per use</p>
                </div>
              </div>
              <ul class="space-y-2 text-gray-700">
                <li class="flex items-center gap-2">
                  <span class="text-blue-600">→</span>
                  <span>Only pay for what you use beyond 100</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-blue-600">→</span>
                  <span>No monthly minimums</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-blue-600">→</span>
                  <span>Billed monthly</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Pricing Examples -->
          <div class="mt-8 pt-8 border-t border-gray-200">
            <h3 class="text-lg font-semibold mb-4">Pricing Examples</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p class="font-medium">50 uses</p>
                  <p class="text-sm text-gray-600">Within free tier</p>
                </div>
                <div class="text-2xl font-bold text-green-600">$0.00</div>
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p class="font-medium">150 uses</p>
                  <p class="text-sm text-gray-600">100 free + 50 paid</p>
                </div>
                <div class="text-2xl font-bold">$0.50</div>
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p class="font-medium">500 uses</p>
                  <p class="text-sm text-gray-600">100 free + 400 paid</p>
                </div>
                <div class="text-2xl font-bold">$4.00</div>
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p class="font-medium">1,000 uses</p>
                  <p class="text-sm text-gray-600">100 free + 900 paid</p>
                </div>
                <div class="text-2xl font-bold">$9.00</div>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <div class="mt-8 pt-8 border-t border-gray-200 text-center">
            <UButton
              label="Get Started Free"
              color="primary"
              size="xl"
              trailing-icon="i-lucide-arrow-right"
              to="https://app.sendook.com/signup"
              target="_blank"
              class="mb-4"
            />
            <p class="text-sm text-gray-600">No credit card required</p>
          </div>
        </UCard>
      </div>

      <!-- FAQ Section -->
      <div class="max-w-3xl mx-auto mt-16">
        <h2 class="text-3xl font-semibold text-center mb-8">Frequently Asked Questions</h2>
        <div class="space-y-6">
          <UCard>
            <h3 class="text-lg font-semibold mb-2">What counts as a "use"?</h3>
            <p class="text-gray-600">
              Each email sent through Sendook counts as one use. This includes transactional emails, notifications, and any other messages sent via our API.
            </p>
          </UCard>
          <UCard>
            <h3 class="text-lg font-semibold mb-2">When does the free tier reset?</h3>
            <p class="text-gray-600">
              Your free 100 uses reset at the beginning of each calendar month. Unused free uses don't roll over to the next month.
            </p>
          </UCard>
          <UCard>
            <h3 class="text-lg font-semibold mb-2">How am I billed?</h3>
            <p class="text-gray-600">
              You're billed monthly for any usage beyond your free tier. Invoices are sent at the end of each month, and payment is due within 30 days.
            </p>
          </UCard>
          <UCard>
            <h3 class="text-lg font-semibold mb-2">Can I upgrade or change my plan?</h3>
            <p class="text-gray-600">
              There's no plan to upgrade to—our pricing is simple and scales automatically with your usage. You always get 100 free uses per month, plus $0.01 per additional use.
            </p>
          </UCard>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<style scoped>
.pricing-page {
  min-height: calc(100vh - 200px);
}

.pricing-card {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}
</style>

