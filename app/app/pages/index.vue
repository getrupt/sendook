<template>
  <DashboardShell>
    <template #header>
      <div class="page-heading">
        <div>
          <h1>Emails</h1>
          <p>Track sending performance, previews, and delivery diagnostics in real time.</p>
        </div>
        <button class="primary-action" type="button">
          <span>New email</span>
        </button>
      </div>
    </template>

    <section class="toolbar">
      <div class="tab-group">
        <button class="tab is-active" type="button">Sending</button>
        <button class="tab" type="button">Receiving</button>
      </div>
      <div class="filters">
        <div class="search-field">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path
              d="M5 7.5 11.45 12a1 1 0 0 0 1.1 0L19 7.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <input type="search" placeholder="Search messages">
        </div>
        <select>
          <option>Last 15 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
        <select>
          <option>All statuses</option>
          <option>Delivered</option>
          <option>Queued</option>
          <option>Bounced</option>
        </select>
        <select>
          <option>All API keys</option>
          <option>Production</option>
          <option>Staging</option>
        </select>
        <button class="icon-button" type="button" aria-label="Download report">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 4v10m0 0 4-4m-4 4-4-4M5 18h14"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>

    <section class="empty-state">
      <div class="empty-card">
        <div class="empty-icon">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="m4 10 16-7-7 16-2-6-6-3Z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h2>No sent emails yet</h2>
        <p>Start sending emails to see insights and previews for every message.</p>
        <a class="docs-link" href="https://docs.sendook.dev" target="_blank" rel="noreferrer">
          Go to docs
        </a>
      </div>
    </section>
  </DashboardShell>
</template>

<script setup lang="ts">
defineOptions({
  name: 'DashboardPage'
});

useRequireAuth();
</script>

<style scoped>
.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.page-heading h1 {
  font-size: 2.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  margin-top: 0;
}

.page-heading p {
  color: rgba(255, 255, 255, 0.6);
  max-width: 520px;
  line-height: 1.5;
}

.primary-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  padding: 0.85rem 1.3rem;
  border-radius: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  background: rgba(99, 102, 241, 0.2);
  color: #c7d2fe;
  cursor: pointer;
}

.primary-action:hover {
  background: rgba(99, 102, 241, 0.35);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: space-between;
  align-items: center;
  background: rgba(12, 12, 18, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 1.25rem;
}

.tab-group {
  display: inline-flex;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 0.85rem;
  padding: 0.25rem;
}

.tab {
  padding: 0.6rem 1.25rem;
  border-radius: 0.7rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  font-weight: 500;
}

.tab.is-active {
  background: #111129;
  color: #fff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.filters {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filters select {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.75rem;
  padding: 0.65rem 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.filters select:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.6);
}

.search-field {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
}

.search-field input {
  background: transparent;
  border: none;
  color: inherit;
  width: 180px;
}

.search-field input:focus {
  outline: none;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
}

.icon-button:hover {
  background: rgba(255, 255, 255, 0.08);
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-card {
  text-align: center;
  padding: 5rem 3rem;
  background: rgba(10, 10, 16, 0.55);
  border: 1px dashed rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem;
  display: grid;
  gap: 1.25rem;
  max-width: 540px;
}

.empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 1.25rem;
  margin: 0 auto;
  display: grid;
  place-items: center;
  background: rgba(99, 102, 241, 0.16);
  color: #c7d2fe;
}

.empty-card h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

.empty-card p {
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
}

.docs-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.9rem 1.5rem;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
}

.docs-link:hover {
  background: rgba(255, 255, 255, 0.12);
}

.icon {
  width: 20px;
  height: 20px;
}

@media (max-width: 1100px) {
  .filters {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

@media (max-width: 780px) {
  .page-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .filters {
    width: 100%;
    justify-content: stretch;
  }

  .filters select,
  .search-field {
    width: 100%;
  }
}
</style>

