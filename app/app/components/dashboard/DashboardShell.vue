<template>
  <div class="dashboard-shell">
    <aside class="dashboard-sidebar">
      <div class="sidebar-inner">
        <div class="sidebar-brand">
          <span class="brand-mark">S</span>
          <span class="brand-name">Sendook</span>
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
      <button class="logout" type="button" @click="handleLogout">
        <span>Log out</span>
      </button>
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
import { useRoute, useRouter } from 'vue-router';

interface NavLink {
  label: string;
  to: string;
}

const links: NavLink[] = [
  { label: 'Dashboard', to: '/' },
  { label: 'Messages', to: '/messages' },
  { label: 'Inboxes', to: '/inboxes' },
  { label: 'API Keys', to: '/api-keys' },
  { label: 'Domains', to: '/domains' }
];

const route = useRoute();
const router = useRouter();

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
  /* display: grid; */
  /* grid-template-columns: 240px 1fr;
  gap: 1rem; */
  min-height: 100vh;
  padding-left: 240px;
}

.dashboard-sidebar {
  padding: 1.75rem 1.5rem; 
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  flex-direction: column;
  gap: 1.75rem;
  justify-content: space-between;
  width: 200px;
  height: calc(100vh - 4rem);
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

.brand-mark {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.9rem;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  font-weight: 700;
}

.brand-name {
  font-size: 1.1rem;
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
  border-radius: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}

.sidebar-link:hover {
  background: rgba(99, 102, 241, 0.16);
  color: #fff;
}

.sidebar-link.active {
  background: rgba(99, 102, 241, 0.26);
  color: #fff;
  border: 1px solid rgba(99, 102, 241, 0.35);
}

.logout {
  margin-top: auto;
  border: none;
  border-radius: 0.85rem;
  background: rgba(248, 113, 113, 0.14);
  color: #fecaca;
  padding: 0.75rem 1rem;
  font-weight: 600;
  cursor: pointer;
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
  min-height: 100%;
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

