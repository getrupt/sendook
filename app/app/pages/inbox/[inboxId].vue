<template>
  <DashboardShell>
    <template #header>
      <div class="page-heading">
        <div>
          <NuxtLink class="back-link" to="/inboxes">← Back to Inboxes</NuxtLink>
          <h1>{{ inboxName }}</h1>
          <p v-if="inboxAddress">
            Messages captured for <span class="highlight">{{ inboxAddress }}</span>
          </p>
        </div>
        <div class="toolbar">
          <input
            v-model="search"
            type="search"
            placeholder="Search messages"
            class="search-input"
            :disabled="loading"
          >
        </div>
      </div>
    </template>

    <section v-if="loading" class="placeholder-card">
      <h2>Loading messages…</h2>
      <p>Fetching the conversation history for this inbox.</p>
    </section>

    <template v-else>
      <div v-if="error" class="banner banner-error" role="alert">
        {{ error }}
      </div>

      <section v-if="filteredMessages.length === 0" class="placeholder-card">
        <h2>No messages yet</h2>
        <p>Send a test email to this inbox or wait for new activity to appear here.</p>
      </section>

      <section v-else class="messages-list">
        <article v-for="message in filteredMessages" :key="message._id" class="message-card">
          <header>
            <div>
              <h3>{{ message.subject ?? '(no subject)' }}</h3>
              <p class="meta">
                From <span>{{ message.from }}</span> · {{ formatDate(message.createdAt) }}
              </p>
            </div>
            <span class="status-pill">{{ message.status ?? 'sent' }}</span>
          </header>
          <p class="preview">
            {{ message.text?.slice(0, 200) ?? 'No preview available.' }}
          </p>
          <footer>
            <button type="button" class="button-secondary" @click="openMessage(message)">
              View message
            </button>
          </footer>
        </article>
      </section>
    </template>

    <Transition name="fade">
      <div v-if="activeMessage" class="dialog-backdrop" role="dialog" aria-modal="true">
        <div class="dialog-card dialog-large">
          <header class="dialog-header">
            <div>
              <h2>{{ activeMessage.subject ?? '(no subject)' }}</h2>
              <p class="meta mt-1">
                From <span>{{ activeMessage.from }}</span> · {{ formatDate(activeMessage.createdAt) }}
              </p>
            </div>
            <button type="button" class="icon-close" aria-label="Close" @click="closeMessage">
              ×
            </button>
          </header>
          <div class="message-body">
            <div v-if="modalLoading" class="loading-state">Loading message…</div>
            <div v-else-if="modalError" class="modal-error" role="alert">{{ modalError }}</div>
            <pre v-else>{{ activeMessage.text ?? 'No content available.' }}</pre>
          </div>
        </div>
      </div>
    </Transition>
  </DashboardShell>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

defineOptions({
  name: 'InboxDetailPage'
});

const route = useRoute();
const session = useRequireAuth();
const config = useRuntimeConfig();

interface InboxMessage {
  _id: string;
  subject?: string;
  from?: string;
  text?: string;
  status?: string;
  createdAt?: string;
}

interface InboxSummary {
  _id?: string;
  name?: string;
  email?: string;
}

const loading = ref(true);
const messages = ref<InboxMessage[]>([]);
const inboxSummary = ref<InboxSummary | null>(null);
const activeMessage = ref<InboxMessage | null>(null);
const modalLoading = ref(false);
const modalError = ref('');
const error = ref('');
const search = ref('');

const organizationId = computed(() => session.organizationId.value);
const inboxId = computed(() => route.params.inboxId as string);

const inboxName = computed(() => inboxSummary.value?.name ?? 'Inbox');
const inboxAddress = computed(() => inboxSummary.value?.email ?? inboxSummary.value?._id);

const filteredMessages = computed(() => {
  if (!search.value.trim()) {
    return messages.value;
  }
  const needle = search.value.toLowerCase();
  return messages.value.filter((message) =>
    [message.subject, message.from, message.text]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(needle))
  );
});

const formatDate = (value?: string) => {
  if (!value) {
    return 'Recently';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const openMessage = async (message: InboxMessage) => {
  modalError.value = '';
  modalLoading.value = true;
  activeMessage.value = message;

  const orgId = organizationId.value;
  const inbox = inboxId.value;
  const token = session.token.value;

  if (!orgId || !inbox || !token) {
    modalError.value = 'Missing inbox context.';
    modalLoading.value = false;
    return;
  }

  try {
    const fullMessage = await $fetch<InboxMessage>(
      `${config.public.apiUrl}/organizations/${orgId}/inboxes/${inbox}/messages/${message._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    activeMessage.value = fullMessage;
  } catch (err) {
    console.error('Failed to load message', err);
    modalError.value =
      err instanceof Error ? err.message : 'Unable to load message details. Please try again.';
  } finally {
    modalLoading.value = false;
  }
};

const closeMessage = () => {
  activeMessage.value = null;
  modalError.value = '';
  modalLoading.value = false;
};

const fetchInboxMessages = async () => {
  const orgId = organizationId.value;
  const inbox = inboxId.value;
  const token = session.token.value;

  if (!orgId || !inbox || !token) {
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const data = await $fetch<InboxMessage[] | { inbox?: InboxSummary; messages?: InboxMessage[] }>(
      `${config.public.apiUrl}/organizations/${orgId}/inboxes/${inbox}/messages`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (Array.isArray(data)) {
      messages.value = data;
      inboxSummary.value = inboxSummary.value ?? { _id: inbox };
    } else {
      inboxSummary.value = data.inbox ?? inboxSummary.value ?? { _id: inbox };
      messages.value = Array.isArray(data.messages) ? data.messages : [];
    }
  } catch (err) {
    console.error('Failed to load inbox messages', err);
    error.value = err instanceof Error ? err.message : 'Unable to load inbox messages.';
  } finally {
    loading.value = false;
  }
};

watch(
  () => [organizationId.value, inboxId.value, session.token.value],
  ([orgId, inbox, token]) => {
    if (orgId && inbox && token) {
      void fetchInboxMessages();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.back-link {
  display: inline-block;
  margin-bottom: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.9rem;
}

.back-link:hover {
  color: rgba(255, 255, 255, 0.85);
}

.page-heading h1 {
  font-size: 2.15rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.page-heading p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
}

.highlight {
  color: #c7d2fe;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.85rem;
  padding: 0.75rem 1rem;
  color: #fff;
  min-width: 240px;
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

.messages-list {
  display: grid;
  gap: 1.5rem;
}

.message-card {
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(12, 12, 18, 0.6);
  padding: 1.75rem;
  display: grid;
  gap: 1.25rem;
}

.message-card header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.message-card h3 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.meta {
  margin: 0;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.9rem;
}

.status-pill {
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  background: rgba(59, 130, 246, 0.18);
  color: #bfdbfe;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.preview {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.button-secondary {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  border-radius: 0.75rem;
  padding: 0.65rem 1.2rem;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.button-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.banner {
  padding: 1rem 1.25rem;
  border-radius: 0.85rem;
  margin-bottom: 1.25rem;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.banner-error {
  background: rgba(248, 113, 113, 0.16);
  border: 1px solid rgba(248, 113, 113, 0.36);
  color: #fecaca;
}

.dialog-large {
  width: min(720px, 100%);
}

.message-body {
  background: rgba(7, 7, 11, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 1.5rem;
  overflow: auto;
  max-height: 60vh;
}

.loading-state {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.95rem;
  text-align: center;
}

.modal-error {
  color: #fecaca;
  background: rgba(248, 113, 113, 0.14);
  border: 1px solid rgba(248, 113, 113, 0.36);
  padding: 1rem;
  border-radius: 0.85rem;
  font-size: 0.9rem;
}

.message-body pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: rgba(255, 255, 255, 0.85);
  font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  font-size: 0.9rem;
  line-height: 1.6;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(3, 3, 7, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 30;
}

.dialog-card {
  width: min(420px, 100%);
  background: rgba(10, 10, 16, 0.92);
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.45);
  padding: 2rem;
  display: grid;
  gap: 1.5rem;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.icon-close {
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
}

.dialog-form {
  display: grid;
  gap: 1.25rem;
}

.dialog-form label {
  display: grid;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.78);
}

.dialog-form input,
.dialog-form select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.85rem;
  padding: 0.85rem 1rem;
  color: #fff;
}

.dialog-form input:focus,
.dialog-form select:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.55);
}

.dialog-form small {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
}

.dialog-error {
  border-radius: 0.85rem;
  padding: 0.85rem 1rem;
  background: rgba(248, 113, 113, 0.16);
  border: 1px solid rgba(248, 113, 113, 0.36);
  color: #fecaca;
  font-size: 0.9rem;
}

.dialog-form footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (max-width: 900px) {
  .page-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-input {
    width: 100%;
    min-width: 0;
  }
}
</style>

