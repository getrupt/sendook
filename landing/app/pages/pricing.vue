<script setup lang="ts">
const { data: rawPage } = await useAsyncData('pricing', async () => {
  const result = await queryCollection('pricing').first()
  
  // Nuxt Content often stores YAML data in the body property
  // Merge body data into the root object
  if (result?.body && typeof result.body === 'object') {
    return { ...result.body, ...result }
  }
  
  return result
}) as any

const page = rawPage

const title = page.value?.seo?.title || page.value?.title || 'Pricing'
const description = page.value?.seo?.description || page.value?.description || 'Transparent Pricing'

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

defineOgImageComponent('Saas')
</script>

<template>
  <div v-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
    />

    <UContainer>
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start py-12">
        <!-- Left side: Content -->
        <div class="space-y-12">
          <div>
            <h2 class="text-3xl font-bold text-highlighted mb-4">
              {{ page.pricing?.tagline }}
            </h2>
            <p class="text-lg text-muted leading-relaxed whitespace-pre-line">
              {{ page.pricing?.description }}
            </p>
          </div>

          <!-- Benefits -->
          <div class="space-y-6">
            <UPageCard
              v-for="(benefit, index) in page.pricing?.benefits || []"
              :key="index"
              :title="benefit.title"
              :description="benefit.description"
              :icon="benefit.icon"
              class="bg-accented/5"
            />
          </div>
        </div>

        <!-- Right side: Pricing Card -->
        <div class="lg:sticky lg:top-24">
          <UCard
            class="ring-2 ring-primary"
            :ui="{
              body: 'space-y-6',
              ring: 'ring-2 ring-primary'
            }"
          >
            <div class="space-y-2">
              <h3 class="text-2xl font-bold text-highlighted">
                {{ page.plan?.title }}
              </h3>
              <p class="text-muted">
                {{ page.plan?.description }}
              </p>
            </div>

            <!-- Pricing Display -->
            <div class="py-6 border-y border-accented">
              <div class="space-y-4">
                <div>
                  <div class="text-4xl font-bold text-highlighted">
                    {{ page.plan?.price?.base }}
                    <span class="text-lg font-normal text-muted">/month</span>
                  </div>
                  <div class="text-sm text-muted mt-1">
                    First 1,000 emails free
                  </div>
                </div>
                <div class="text-highlighted">
                  <span class="text-2xl font-semibold">{{ page.plan?.price?.perEmail }}</span>
                  <span class="text-muted"> per additional email</span>
                </div>
              </div>
            </div>

            <!-- Features List -->
            <ul class="space-y-3">
              <li
                v-for="(feature, index) in page.plan?.features || []"
                :key="index"
                class="flex items-start gap-3"
              >
                <UIcon
                  name="i-lucide-check"
                  class="w-5 h-5 flex-shrink-0 text-primary mt-0.5"
                />
                <span class="text-highlighted">{{ feature }}</span>
              </li>
            </ul>

            <!-- CTA Button -->
            <UButton
              :label="page.plan?.button?.label"
              :to="page.plan?.button?.to"
              size="xl"
              block
              class="mt-6"
            />
          </UCard>
        </div>
      </div>
    </UContainer>

    <!-- Cost Calculator -->
    <UPageSection
      v-if="page.calculator"
      :title="page.calculator?.title"
      :description="page.calculator?.description"
      class="bg-accented/5"
    >
      <UPageGrid class="lg:grid-cols-4">
        <UPageCard
          v-for="(example, index) in page.calculator?.examples || []"
          :key="index"
          variant="subtle"
        >
          <template #title>
            <div class="space-y-1">
              <div class="text-3xl font-bold text-highlighted">
                {{ example.cost }}
              </div>
              <div class="text-sm text-muted font-normal">
                {{ example.emails.toLocaleString() }} emails/month
              </div>
            </div>
          </template>
          <template #description>
            <div class="text-muted">
              {{ example.description }}
            </div>
          </template>
        </UPageCard>
      </UPageGrid>
    </UPageSection>

    <!-- FAQ Section -->
    <UPageSection
      v-if="page.faq"
      :title="page.faq?.title"
      :description="page.faq?.description"
    >
      <UAccordion
        :items="page.faq?.items"
        :unmount-on-hide="false"
        :default-value="['0']"
        type="multiple"
        class="max-w-3xl mx-auto"
        :ui="{
          trigger: 'text-base text-highlighted',
          body: 'text-base text-muted'
        }"
      />
    </UPageSection>
  </div>
</template>
