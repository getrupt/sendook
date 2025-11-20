<template>
  <div class="dashboard-shell">
    <aside class="dashboard-sidebar">
      <div class="sidebar-inner">
        <div class="sidebar-brand">
          <img src="/sendook-logo.svg" alt="Sendook" class="brand-logo">
        </div>
        <nav>
          <ul>
            <li v-for="link in links" :key="link.to">
              <NuxtLink :to="link.to" :class="['sidebar-link', { active: isActive(link.to) }]">
                <span>{{ link.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
      <div>
        <div class="message-limit">
          <p class="message-limit-label">Daily message limit</p>
          <div class="message-limit-progress">
            <div class="progress-bar-container">
              <div 
                class="progress-bar-fill" 
                :style="{ width: `${Math.min(session.messageLimit.value?.percentage || 0, 100)}%` }"
                :class="progressBarClass"
              />
            </div>
            <p class="message-limit-text">{{ session.messageLimit.value?.count }} / {{ session.messageLimit.value?.limit }}</p>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface NavLink {
  label: string;
  to: string;
}

const links: NavLink[] = [
  { label: 'Inboxes', to: '/inboxes' },
  { label: 'API Keys', to: '/api-keys' },
  { label: 'Domains', to: '/domains' },
  { label: 'Webhooks', to: '/webhooks' }
];

const route = useRoute();
const router = useRouter();
const session = useRequireAuth();

const userDisplayName = computed(() => {
  const current = session.user.value;
  if (!current) {
    return '';
  }
  const nameParts = [current.firstName as string | undefined, current.lastName as string | undefined].filter(
    (part): part is string => Boolean(part && part.trim().length)
  );

  if (nameParts.length > 0) {
    return nameParts.join(' ');
  }

  return current.email ?? '';
});

const userEmail = computed(() => session.user.value?.email ?? '');

const progressBarClass = computed(() => {
  const percentage = session.messageLimit.value?.percentage || 0;
  if (percentage >= 90) return 'progress-danger';
  if (percentage >= 75) return 'progress-warning';
  return 'progress-normal';
});

const isActive = (target: string) => {
  if (target === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(target);
};

const handleLogout = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'sendook_token=; Max-Age=0; path=/; SameSite=Lax';
  }
  router.replace('/login');
};
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
  transition: background 0.2s ease, color 0.2s ease;
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
  padding: 1rem;
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
  transition: width 0.3s ease, background 0.3s ease;
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
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.logout:hover {
  background: rgba(248, 113, 113, 0.2);
  color: #fff;
  transform: translateY(-1px);
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
</style>

