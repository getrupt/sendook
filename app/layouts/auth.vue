<template>
  <div class="auth-shell">
    <div class="auth-card">
      <div class="brand">
        <span class="brand-mark">S</span>
        <h1>Sendook</h1>
      </div>
      <slot />
    </div>
    <div class="background-orb orb-1" />
    <div class="background-orb orb-2" />
  </div>
</template>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(120% 120% at 50% 0%, #09090f 0%, #020204 100%);
  position: relative;
  overflow: hidden;
  padding: 2rem;
  color: #f5f7fa;
}

.auth-card {
  position: relative;
  z-index: 2;
  width: min(420px, 100%);
  padding: 2.75rem;
  border-radius: 1.5rem;
  background: rgba(9, 9, 15, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 35px 80px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(16px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 2rem;
}

.brand h1 {
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.9rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  font-weight: 700;
  font-size: 1.25rem;
}

.background-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.orb-1 {
  width: 420px;
  height: 420px;
  background: rgba(99, 102, 241, 0.45);
  top: -120px;
  right: -160px;
}

.orb-2 {
  width: 380px;
  height: 380px;
  background: rgba(236, 72, 153, 0.4);
  bottom: -140px;
  left: -150px;
}
</style>

