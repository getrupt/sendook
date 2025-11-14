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

    <section v-else-if="messages.length === 0" class="placeholder-card">
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
          {{ message.preview ?? message.body?.slice(0, 200) ?? 'No preview available.' }}
        </p>
        <footer>
          <button type="button" class="button-secondary" @click="openMessage(message)">
            View message
          </button>
        </footer>
      </article>
    </section>

    <Transition name="fade">
      <div v-if="activeMessage" class="dialog-backdrop" role="dialog" aria-modal="true">
        <div class="dialog-card dialog-large">
          <header class="dialog-header">
            <div>
              <h2>{{ activeMessage.subject ?? '(no subject)' }}</h2>
              <p class="meta">
                From <span>{{ activeMessage.from }}</span> · {{ formatDate(activeMessage.createdAt) }}
              </p>
            </div>
            <button type="button" class="icon-close" aria-label="Close" @click="closeMessage">
              ×
            </button>
          </header>
          <div class="message-body">
            <pre>{{ activeMessage.body ?? 'No content available.' }}</pre>
          </div>
        </div>
      </div>
    </Transition>
  </DashboardShell>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

defineOptions({
  name: 'InboxDetailPage'
});

const route = useRoute();
// const router = useRouter();
const session = useRequireAuth();
const config = useRuntimeConfig();

interface InboxMessage {
  _id: string;
  subject?: string;
  from?: string;
  body?: string;
  preview?: string;
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
    [message.subject, message.from, message.preview, message.body]
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

const openMessage = (message: InboxMessage) => {
  activeMessage.value = message;
};

const closeMessage = () => {
  activeMessage.value = null;
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
    const response = await fetch(
      `${config.public.apiUrl}/organizations/${orgId}/inboxes/${inbox}/messages`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Unable to load messages: ${response.status}`);
    }

    const data = (await response.json()) as {
      inbox?: InboxSummary;
      messages?: InboxMessage[];
    };

    inboxSummary.value = data.inbox ?? inboxSummary.value;
    messages.value = Array.isArray(data.messages) ? data.messages : [];
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

