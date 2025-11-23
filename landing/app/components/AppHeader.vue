<script setup lang="ts">
const route = useRoute()

const items = computed(() => [{
  label: 'Docs',
  to: '/docs',
  active: route.path.startsWith('/docs')
}, {
  label: 'Pricing',
  to: '/pricing',
  active: route.path === '/pricing'
}])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <AppLogo />
      </NuxtLink>

      <div class="w-[10px]" />

      <UNavigationMenu
        :items="items"
        variant="link"
      />
    </template>

    <template #right>
      <UButton
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
        to="https://github.com/getrupt/sendook"
        target="_blank"
        aria-label="View on GitHub"
      />

      <UButton
        icon="i-lucide-log-in"
        color="neutral"
        variant="ghost"
        to="https://app.sendook.com/login"
        target="_blank"
        class="lg:hidden"
      />

      <UButton
        label="Sign in"
        color="neutral"
        variant="outline"
        to="https://app.sendook.com/login"
        target="_blank"
        class="hidden lg:inline-flex"
      />

      <UButton
        label="Sign up"
        color="primary"
        trailing-icon="i-lucide-arrow-right"
        class="hidden lg:inline-flex"
        to="https://app.sendook.com/signup"
        target="_blank"
      />
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />

      <USeparator class="my-6" />

      <UButton
        label="Sign in"
        color="neutral"
        variant="subtle"
        to="https://app.sendook.com/login"
        target="_blank"
        block
        class="mb-3"
      />
      <UButton
        label="Sign up"
        color="primary"
        to="https://app.sendook.com/signup"
        target="_blank"
        block
      />
    </template>
  </UHeader>
</template>
