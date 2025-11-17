<template>
  <div class="relative w-full h-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl overflow-hidden p-8">
    <!-- Background grid pattern -->
    <div class="absolute inset-0 opacity-5">
      <div class="grid grid-cols-8 grid-rows-8 w-full h-full">
        <div v-for="i in 64" :key="i" class="border border-gray-400" />
      </div>
    </div>

    <!-- Speed lines background -->
    <div class="absolute inset-0 overflow-hidden">
      <div 
        v-for="i in 5" 
        :key="`line-${i}`"
        class="absolute h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent animate-speed-line"
        :style="{ 
          top: `${20 * i}%`,
          animationDelay: `${i * 0.4}s`
        }"
      />
    </div>

    <!-- Main content -->
    <div class="relative flex items-center justify-center gap-6">
      <!-- Email sending animation -->
      <div class="relative">
        <div class="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center">
          <UIcon name="i-lucide-send" class="w-10 h-10 text-primary-500 animate-pulse" />
        </div>
        
        <!-- Flying envelopes -->
        <div 
          v-for="i in 3" 
          :key="`envelope-${i}`"
          class="absolute top-1/2 left-1/2 -translate-y-1/2 animate-fly-right"
          :style="{ animationDelay: `${i * 0.6}s` }"
        >
          <div class="w-8 h-8 bg-yellow-400 rounded-lg shadow-md flex items-center justify-center">
            <UIcon name="i-lucide-mail" class="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      <!-- Search animation -->
      <div class="relative flex flex-col gap-4">
        <div class="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center animate-scale-pulse">
          <UIcon name="i-lucide-search" class="w-8 h-8 text-blue-500" />
        </div>
        
        <!-- Search results appearing -->
        <div class="flex flex-col gap-1">
          <div 
            v-for="i in 3" 
            :key="`result-${i}`"
            class="w-12 h-1.5 bg-primary-500 rounded-full animate-appear"
            :style="{ animationDelay: `${i * 0.2}s` }"
          />
        </div>
      </div>

      <!-- Shield with checkmark -->
      <div class="relative">
        <div class="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center">
          <UIcon name="i-lucide-shield-check" class="w-10 h-10 text-green-500 animate-bounce-slow" />
        </div>
        
        <!-- Success indicator -->
        <div class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-success-pop">
          <UIcon name="i-lucide-check" class="w-4 h-4 text-white" />
        </div>
      </div>
    </div>

    <!-- Performance metrics -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
      <div class="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-primary-500 animate-fade-in">
        <span class="animate-counter">99.9%</span> uptime
      </div>
      <div class="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-blue-500 animate-fade-in" style="animation-delay: 0.3s;">
        <span class="animate-counter">&lt;100ms</span> response
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes speed-line {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(200%);
    opacity: 0;
  }
}

@keyframes fly-right {
  0% {
    transform: translate(-50%, -50%) translateX(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) translateX(150px) rotate(15deg);
    opacity: 0;
  }
}

@keyframes scale-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes appear {
  0% {
    transform: scaleX(0);
    opacity: 0;
  }
  100% {
    transform: scaleX(1);
    opacity: 1;
  }
}

@keyframes success-pop {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-speed-line {
  animation: speed-line 2s ease-in-out infinite;
  width: 100%;
}

.animate-fly-right {
  animation: fly-right 1.8s ease-in-out infinite;
}

.animate-scale-pulse {
  animation: scale-pulse 2s ease-in-out infinite;
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

.animate-appear {
  animation: appear 1s ease-out infinite;
  transform-origin: left;
}

.animate-success-pop {
  animation: success-pop 2s ease-in-out infinite;
}

.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
  opacity: 0;
}

.animate-counter {
  display: inline-block;
  font-variant-numeric: tabular-nums;
}
</style>

