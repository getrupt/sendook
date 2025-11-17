<template>
  <USeparator class="h-px" />

  <UFooter>
    <template #left>
      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="flex items-center gap-2">
          <img src="/sendook-logomark.svg" alt="sendook" class="w-6 h-6" />
          <span class="text-muted text-sm">© {{ new Date().getFullYear() }} sendook</span>
        </NuxtLink>
        <span class="text-muted text-sm">•</span>
        <a 
          href="https://rupt.dev" 
          target="_blank"
          rel="noopener noreferrer"
          class="text-muted text-sm hover:text-primary-500 transition-colors flex items-center gap-1"
        >
          Built with <span class="text-red-500">♥</span> by Rupt
        </a>
      </div>
    </template>

    <template #right>
      <UButton
        to="https://twitter.com/sendook"
        target="_blank"
        icon="i-simple-icons-x"
        aria-label="sendook on X"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://github.com/getrupt/sendook"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="sendook on GitHub"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>
