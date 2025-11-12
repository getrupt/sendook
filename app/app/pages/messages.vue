<template>
  <DashboardShell>
    <template #header>
      <div class="page-heading">
        <div>
          <h1>Messages</h1>
          <p>Monitor delivery, status, and diagnostics for every message across your workspace.</p>
        </div>
        <button class="primary-action" type="button">
          <span>Compose message</span>
        </button>
      </div>
    </template>

    <section class="placeholder-card">
      <h2>Coming soon</h2>
      <p>
        Messages will list all outbound activity, including delivery attempts, bounces, and previews.
        Connect your sending pipeline to populate this view.
      </p>
    </section>
  </DashboardShell>
</template>

<script setup lang="ts">
defineOptions({
  name: 'MessagesPage'
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

.placeholder-card {
  text-align: left;
  padding: 3rem;
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(12, 12, 18, 0.5);
  display: grid;
  gap: 1rem;
}

.placeholder-card h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

.placeholder-card p {
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
}

@media (max-width: 780px) {
  .page-heading {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

