<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="brand">
        <span class="brand-mark">S</span>
        <span class="brand-name">Sendook</span>
      </div>
      <slot name="header-actions" />
    </header>
    <div class="app-body">
      <aside class="sidebar">
        <nav>
          <p class="sidebar-section">Platform</p>
          <ul>
            <li><NuxtLink to="/" class="nav-link">Dashboard</NuxtLink></li>
            <li><a href="#" class="nav-link is-disabled">Emails</a></li>
            <li><a href="#" class="nav-link is-disabled">Broadcasts</a></li>
            <li><a href="#" class="nav-link is-disabled">Templates</a></li>
            <li><a href="#" class="nav-link is-disabled">Audience</a></li>
            <li><a href="#" class="nav-link is-disabled">Metrics</a></li>
            <li><a href="#" class="nav-link is-disabled">Domains</a></li>
            <li><a href="#" class="nav-link is-disabled">Logs</a></li>
            <li><a href="#" class="nav-link is-disabled">API Keys</a></li>
            <li><a href="#" class="nav-link is-disabled">Webhooks</a></li>
            <li><a href="#" class="nav-link is-disabled">Settings</a></li>
          </ul>
        </nav>
        <div class="sidebar-footer">
          <div class="user-avatar">M</div>
          <div class="user-details">
            <p class="user-name">Marc Whitbread</p>
            <p class="user-email">marc@sendook.dev</p>
          </div>
        </div>
      </aside>
      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: radial-gradient(180% 180% at 50% 0%, #121219 0%, #050508 100%);
  color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.4rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  font-weight: 700;
}

.app-body {
  display: flex;
  flex: 1;
  padding: 2rem;
  gap: 2rem;
}

.sidebar {
  width: 240px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(12, 12, 18, 0.6);
  border-radius: 1rem;
  padding: 1.75rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.sidebar-section {
  text-transform: uppercase;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.1em;
  margin-bottom: 1.5rem;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
}

.nav-link {
  display: block;
  padding: 0.75rem 1rem;
  border-radius: 0.4rem;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}

.nav-link:hover {
  background: rgba(99, 102, 241, 0.16);
  color: #fff;
}

.nav-link.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.4rem;
  background: rgba(255, 255, 255, 0.04);
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.4rem;
  background: rgba(99, 102, 241, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.user-name {
  font-size: 0.95rem;
  font-weight: 600;
}

.user-email {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
}

.content {
  flex: 1;
  background: rgba(10, 10, 16, 0.65);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 2rem;
  backdrop-filter: blur(10px);
  overflow: hidden;
}

@media (max-width: 1024px) {
  .app-body {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    align-items: center;
    gap: 1.5rem;
  }

  .sidebar nav {
    flex: 1;
  }

  .sidebar ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .sidebar-footer {
    margin-left: auto;
  }
}
</style>

