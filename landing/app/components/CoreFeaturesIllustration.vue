<template>
  <div class="relative w-full h-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl overflow-hidden p-8">
    <!-- Background decoration -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-10 left-10 w-32 h-32 bg-primary-500 rounded-full blur-3xl animate-pulse" />
      <div class="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;" />
    </div>

    <!-- Main content -->
    <div class="relative flex flex-col items-center justify-center gap-8 w-full">
      <!-- Inbox icon with animation -->
      <div class="relative">
        <div class="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-float">
          <UIcon name="i-lucide-inbox" class="w-12 h-12 text-primary-500" />
        </div>
        <!-- Incoming email animations -->
        <div 
          v-for="i in 3" 
          :key="i"
          class="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-yellow-400 rounded-lg shadow-md flex items-center justify-center animate-email-drop"
          :style="{ animationDelay: `${i * 0.8}s` }"
        >
          <UIcon name="i-lucide-mail" class="w-6 h-6 text-white" />
        </div>
      </div>

      <!-- Connection lines -->
      <div class="flex gap-8 items-center">
        <!-- Webhook icon -->
        <div class="relative">
          <div class="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center animate-pulse-slow">
            <UIcon name="i-lucide-webhook" class="w-8 h-8 text-blue-500" />
          </div>
          <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
        </div>

        <!-- Arrow -->
        <div class="flex flex-col gap-1">
          <div class="w-12 h-0.5 bg-primary-500 animate-pulse" />
          <div class="w-12 h-0.5 bg-primary-500 animate-pulse" style="animation-delay: 0.3s;" />
        </div>

        <!-- JSON icon -->
        <div class="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center animate-bounce-slow">
          <UIcon name="i-lucide-file-json" class="w-8 h-8 text-orange-500" />
        </div>
      </div>

      <!-- Decorative elements -->
      <div class="flex gap-2 mt-4">
        <div class="w-2 h-2 bg-primary-500 rounded-full animate-ping" />
        <div class="w-2 h-2 bg-blue-500 rounded-full animate-ping" style="animation-delay: 0.3s;" />
        <div class="w-2 h-2 bg-yellow-500 rounded-full animate-ping" style="animation-delay: 0.6s;" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes email-drop {
  0% {
    transform: translate(-50%, -100px);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, 100px);
    opacity: 0;
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-email-drop {
  animation: email-drop 2.4s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-bounce-slow {
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
</style>

