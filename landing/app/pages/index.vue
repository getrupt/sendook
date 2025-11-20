<script setup lang="ts">
const { data: rawPage } = (await useAsyncData("index", async () => {
  const result = await queryCollection("index").first();

  // Nuxt Content often stores YAML data in the body property
  // Merge body data into the root object
  if (result?.body && typeof result.body === "object") {
    return { ...result.body, ...result };
  }

  return result;
})) as any;

const page = rawPage;

const title = page.value?.seo?.title || page.value?.title || "Default Title";
const description =
  page.value?.seo?.description ||
  page.value?.description ||
  "Default Description";

useSeoMeta({
  titleTemplate: "",
  title,
  ogTitle: title,
  description,
  ogDescription: description,
});
</script>

<template>
  <div>
    <div v-if="!page" class="p-8">
      <h1 class="text-2xl font-bold text-red-500">⚠️ Page data not loaded</h1>
      <p class="mt-4">Check the browser console for error messages.</p>
      <p class="mt-2 text-sm text-gray-600">page value: {{ page }}</p>
    </div>

    <div v-if="page">
      <UPageHero
        :title="page.title"
        :description="page.description"
        :links="page?.hero?.links"
      >
        <template #top>
          <HeroBackground />
        </template>

        <template #title>
          <MDC :value="page.title" unwrap="p" />
        </template>

        <HeroCodeDemo />
      </UPageHero>

      <UPageSection
        v-for="(section, index) in page.sections || []"
        :key="index"
        :title="section.title"
        :description="section.description"
        :orientation="section.orientation"
        :reverse="section.reverse"
        :features="section.features"
        class="animate-section"
      >
        <CoreFeaturesIllustration v-if="section.title === 'Core Features'" />
        <SpeedIllustration v-else-if="section.title === 'Built for Speed'" />
        <ImagePlaceholder v-else />
      </UPageSection>

      <UPageSection
        v-if="page.features"
        :title="page.features.title"
        :description="page.features.description"
        class="animate-section"
      >
        <UPageGrid>
          <UPageCard
            v-for="(item, index) in page.features.items || []"
            :key="index"
            v-bind="item"
            spotlight
            class="animate-card"
            :style="{ animationDelay: `${index * 100}ms` }"
          />
        </UPageGrid>
      </UPageSection>

      <USeparator />

      <UPageCTA
        v-if="page.cta"
        v-bind="page.cta"
        variant="naked"
        class="overflow-hidden"
      >
        <LazyStarsBg />
      </UPageCTA>
    </div>
  </div>
</template>
