<template>
  <DashboardShell>
    <template #header>
      <div class="page-heading">
        <div>
          <h1>Webhooks</h1>
          <p>Configure webhooks to receive real-time notifications for inbox and message events.</p>
        </div>
        <button class="primary-action" type="button" @click="openCreateDialog">
          <span>Add webhook</span>
        </button>
      </div>
    </template>

    <section v-if="loading" class="placeholder-card">
      <h2>Loading webhooks…</h2>
      <p>We are fetching your configured webhooks.</p>
    </section>

    <template v-else>
      <div v-if="verificationMessage" class="banner banner-success">
        {{ verificationMessage }}
      </div>
      <div v-if="verificationError" class="banner banner-error" role="alert">
        {{ verificationError }}
      </div>

      <section v-if="webhooks.length === 0" class="placeholder-card">
        <h2>Connect your webhook</h2>
        <p>
          Webhooks will appear here once they are configured. Add a webhook URL and select events to
          receive real-time notifications.
        </p>
      </section>

      <section v-else class="domains-grid">
        <article v-for="webhook in webhooks" :key="webhook._id ?? webhook.url" class="domain-card">
          <header>
            <div class="domain-heading flex items-center gap-2 w-full">
              <h3 class="flex-1">{{ webhook.url }}</h3>
              <button
                type="button"
                class="icon-delete"
                aria-label="Delete webhook"
                @click="openDeleteDialog(webhook)"
              >
                ×
              </button>
            </div>
          </header>
          <ul class="meta">
            <li>
              <span class="meta-label">Created</span>
              <span>{{ formatDate(webhook.createdAt) }}</span>
            </li>
            <li>
              <span class="meta-label">Events</span>
              <span class="events-count">{{ webhook.events?.length ?? 0 }} event{{ webhook.events?.length !== 1 ? 's' : '' }}</span>
            </li>
          </ul>
          <footer>
            <span>{{ webhook.events?.join(', ') || 'No events configured' }}</span>
            <button
              type="button"
              class="button-verify"
              @click="openDetailsDialog(webhook)"
            >
              View Details
            </button>
          </footer>
        </article>
      </section>
    </template>

    <Transition name="fade">
      <div v-if="showDialog" class="dialog-backdrop" role="dialog" aria-modal="true">
        <div class="dialog-card">
          <header class="dialog-header">
            <h2>Add webhook</h2>
            <button type="button" class="icon-close" aria-label="Close" @click="closeCreateDialog">
              ×
            </button>
          </header>
          <form class="dialog-form" @submit.prevent="handleCreateWebhook">
            <label>
              <span>Webhook URL</span>
              <input
                v-model="form.url"
                type="url"
                placeholder="https://example.com/webhook"
                required
                :disabled="saving">
            </label>

            <label>
              <span>Events</span>
              <div class="events-selection">
                <label v-for="event in availableEvents" :key="event" class="event-checkbox">
                  <input
                    v-model="form.events"
                    type="checkbox"
                    :value="event"
                    :disabled="saving">
                  <div class="event-label">{{ event }}</div>
                </label>
              </div>
            </label>

            <p v-if="errorMessage" class="dialog-error" role="alert">{{ errorMessage }}</p>

            <footer>
              <button type="button" class="button-secondary" :disabled="saving" @click="closeCreateDialog">
                Cancel
              </button>
              <button type="submit" class="button-primary" :disabled="saving || form.events.length === 0">
                <span v-if="saving">Adding…</span>
                <span v-else>Add webhook</span>
              </button>
            </footer>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showDeleteDialog" class="dialog-backdrop" role="dialog" aria-modal="true">
        <div class="dialog-card">
          <header class="dialog-header">
            <h2>Delete webhook</h2>
            <button type="button" class="icon-close" aria-label="Close" @click="closeDeleteDialog">
              ×
            </button>
          </header>
          <div class="dialog-body">
            <p>
              Removing <strong>{{ pendingDelete?.url ?? 'this webhook' }}</strong> will stop all
              event notifications to this endpoint. Continue?
            </p>
            <p v-if="deleteError" class="dialog-error" role="alert">{{ deleteError }}</p>
          </div>
          <footer class="dialog-footer">
            <button type="button" class="button-secondary" :disabled="deleting" @click="closeDeleteDialog">
              Cancel
            </button>
            <button type="button" class="button-primary" :disabled="deleting" @click="handleDeleteWebhook">
              <span v-if="deleting">Deleting…</span>
              <span v-else>Delete webhook</span>
            </button>
          </footer>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showDetailsDialog" class="dialog-backdrop" role="dialog" aria-modal="true">
        <div class="dialog-card dialog-card-large">
          <header class="dialog-header">
            <h2>Webhook Details</h2>
            <button type="button" class="icon-close" aria-label="Close" @click="closeDetailsDialog">
              ×
            </button>
          </header>
          <div class="dialog-body">
            <div v-if="pendingDetails" class="webhook-details">
              <div class="detail-row">
                <span class="detail-label">URL</span>
                <code class="detail-value">{{ pendingDetails.url }}</code>
              </div>
              <div class="detail-row">
                <span class="detail-label">Events</span>
                <div class="events-list">
                  <span
                    v-for="event in pendingDetails.events"
                    :key="event"
                    class="event-tag"
                  >
                    {{ event }}
                  </span>
                  <span v-if="!pendingDetails.events || pendingDetails.events.length === 0" class="event-tag empty">
                    No events
                  </span>
                </div>
              </div>
            </div>
            <div v-if="pendingDetails" class="attempts-section">
              <h3 class="attempts-heading">Recent Attempts</h3>
              <div v-if="loadingAttempts" class="attempts-loading">
                <p>Loading attempts…</p>
              </div>
              <div v-else-if="attemptsError" class="dialog-error" role="alert">
                {{ attemptsError }}
              </div>
              <div v-else-if="attempts.length === 0" class="attempts-empty">
                <p>No attempts found.</p>
              </div>
              <div v-else class="attempts-table-container">
                <table class="attempts-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Event</th>
                      <th>Status</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="attempt in attempts" :key="attempt._id">
                      <td>{{ formatDateTime(attempt.timestamp) }}</td>
                      <td><span class="attempt-event">{{ attempt.payload?.event || 'N/A' }}</span></td>
                      <td>
                        <span :class="['attempt-status', getStatusClass(attempt.status)]">
                          {{ attempt.status }}
                        </span>
                      </td>
                      <td>
                        <span v-if="attempt.error" class="attempt-error">{{ attempt.error }}</span>
                        <span v-else class="attempt-success">Success</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p v-if="detailsError" class="dialog-error" role="alert">{{ detailsError }}</p>
            <div v-if="testMessage" class="banner banner-success">
              {{ testMessage }}
            </div>
            <p v-if="testError" class="dialog-error" role="alert">{{ testError }}</p>
          </div>
          <footer class="dialog-footer">
            <button
              type="button"
              class="button-secondary"
              :disabled="testing"
              @click="handleTestWebhook"
            >
              <span v-if="testing">Testing…</span>
              <span v-else>Test Webhook</span>
            </button>
            <button type="button" class="button-primary" @click="closeDetailsDialog">
              Close
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </DashboardShell>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';

defineOptions({
  name: 'WebhooksPage'
});

const session = useRequireAuth();
const config = useRuntimeConfig();

interface Webhook {
  _id?: string;
  url?: string;
  events?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface WebhookAttempt {
  _id?: string;
  timestamp?: string;
  status?: number;
  error?: string;
  payload?: {
    event?: string;
    payload?: unknown;
  };
  response?: unknown;
}

const availableEvents = [
  'inbox.created',
  'inbox.deleted',
  'inbox.updated',
  'message.sent',
  'message.received',
  'message.delivered',
  'message.bounced',
  'message.complained',
  'message.rejected',
] as const;

const webhooks = ref<Webhook[]>([]);
const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const errorMessage = ref('');
const deleteError = ref('');
const verificationMessage = ref('');
const verificationError = ref('');
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const showDetailsDialog = ref(false);
const pendingDelete = ref<Webhook | null>(null);
const pendingDetails = ref<Webhook | null>(null);
const detailsError = ref('');
const testing = ref(false);
const testMessage = ref('');
const testError = ref('');
const attempts = ref<WebhookAttempt[]>([]);
const loadingAttempts = ref(false);
const attemptsError = ref('');
const form = reactive({
  url: '',
  events: [] as string[]
});

const formatDate = (value?: string) => {
  if (!value) {
    return 'recently';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'recently';
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return 'N/A';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusClass = (status?: number) => {
  if (!status) {
    return 'unknown';
  }
  if (status >= 200 && status < 300) {
    return 'success';
  }
  if (status >= 400 && status < 500) {
    return 'client-error';
  }
  if (status >= 500) {
    return 'server-error';
  }
  return 'unknown';
};

const loadWebhooks = async () => {
  const organizationId = session.organizationId.value;
  const token = session.token.value;

  if (!organizationId || !token) {
    return;
  }

  loading.value = true;

  try {
    const response = await fetch(`${config.public.apiUrl}/organizations/${organizationId}/webhooks`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Unable to fetch webhooks: ${response.status}`);
    }

    const data = (await response.json()) as Webhook[] | { data?: Webhook[] };
    webhooks.value = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error('Failed to load webhooks', error);
    errorMessage.value = 'Unable to load webhooks. Please try again.';
    webhooks.value = [];
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  errorMessage.value = '';
  form.url = '';
  form.events = [];
  showDialog.value = true;
};

const closeCreateDialog = () => {
  showDialog.value = false;
};

const openDeleteDialog = (webhook: Webhook) => {
  pendingDelete.value = webhook;
  deleteError.value = '';
  showDeleteDialog.value = true;
};

const closeDeleteDialog = () => {
  showDeleteDialog.value = false;
  pendingDelete.value = null;
  deleteError.value = '';
};

const openDetailsDialog = async (webhook: Webhook) => {
  pendingDetails.value = webhook;
  detailsError.value = '';
  testMessage.value = '';
  testError.value = '';
  attempts.value = [];
  attemptsError.value = '';
  showDetailsDialog.value = true;
  await loadAttempts(webhook);
};

const closeDetailsDialog = () => {
  showDetailsDialog.value = false;
  pendingDetails.value = null;
  detailsError.value = '';
  testMessage.value = '';
  testError.value = '';
  attempts.value = [];
  attemptsError.value = '';
};

const handleCreateWebhook = async () => {
  const organizationId = session.organizationId.value;
  const token = session.token.value;

  if (!organizationId || !token) {
    errorMessage.value = 'You must be part of an organization to add a webhook.';
    return;
  }

  if (form.events.length === 0) {
    errorMessage.value = 'Please select at least one event.';
    return;
  }

  saving.value = true;
  errorMessage.value = '';

  try {
    const response = await fetch(`${config.public.apiUrl}/organizations/${organizationId}/webhooks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: form.url,
        events: form.events,
      })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(payload.message ?? 'Unable to add webhook.');
    }

    await loadWebhooks();
    closeCreateDialog();
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = 'Unable to add webhook. Please try again.';
    }
  } finally {
    saving.value = false;
  }
};

const handleDeleteWebhook = async () => {
  const organizationId = session.organizationId.value;
  const token = session.token.value;
  const webhookId = pendingDelete.value?._id;

  if (!organizationId || !token || !webhookId) {
    deleteError.value = 'Missing webhook information. Please refresh and try again.';
    return;
  }

  deleting.value = true;
  deleteError.value = '';

  try {
    const response = await fetch(`${config.public.apiUrl}/organizations/${organizationId}/webhooks/${webhookId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(payload.message ?? 'Unable to delete webhook.');
    }

    await loadWebhooks();
    closeDeleteDialog();
  } catch (error) {
    if (error instanceof Error) {
      deleteError.value = error.message;
    } else {
      deleteError.value = 'Unable to delete webhook. Please try again.';
    }
  } finally {
    deleting.value = false;
  }
};

const loadAttempts = async (webhook: Webhook) => {
  const organizationId = session.organizationId.value;
  const token = session.token.value;
  const webhookId = webhook._id;

  if (!organizationId || !token || !webhookId) {
    attemptsError.value = 'Missing webhook information. Please refresh and try again.';
    return;
  }

  loadingAttempts.value = true;
  attemptsError.value = '';

  try {
    const response = await fetch(
      `${config.public.apiUrl}/organizations/${organizationId}/webhooks/${webhookId}/attempts`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
      throw new Error(payload.message ?? payload.error ?? 'Unable to load attempts.');
    }

    const data = (await response.json()) as WebhookAttempt[];
    attempts.value = Array.isArray(data) ? data : [];
  } catch (error) {
    if (error instanceof Error) {
      attemptsError.value = error.message;
    } else {
      attemptsError.value = 'Unable to load attempts. Please try again.';
    }
    attempts.value = [];
  } finally {
    loadingAttempts.value = false;
  }
};

const handleTestWebhook = async () => {
  const organizationId = session.organizationId.value;
  const token = session.token.value;
  const webhookId = pendingDetails.value?._id;

  if (!organizationId || !token || !webhookId) {
    testError.value = 'Missing webhook information. Please refresh and try again.';
    return;
  }

  testing.value = true;
  testMessage.value = '';
  testError.value = '';

  try {
    const response = await fetch(`${config.public.apiUrl}/organizations/${organizationId}/webhooks/${webhookId}/test`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
      throw new Error(payload.message ?? payload.error ?? 'Unable to test webhook.');
    }

    const data = (await response.json()) as { success?: boolean; message?: string };
    testMessage.value = data.message ?? (data.success ? 'Webhook test sent successfully.' : 'Webhook test completed.');
    // Reload attempts after testing
    if (pendingDetails.value) {
      await loadAttempts(pendingDetails.value);
    }
  } catch (error) {
    if (error instanceof Error) {
      testError.value = error.message;
    } else {
      testError.value = 'Unable to test webhook. Please try again.';
    }
  } finally {
    testing.value = false;
  }
};

watch(
  () => [session.organizationId.value, session.token.value],
  ([organizationId, token]) => {
    if (organizationId && token) {
      void loadWebhooks();
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

.domains-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.domain-card {
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(12, 12, 18, 0.6);
  padding: 1.75rem;
  display: grid;
  gap: 1.5rem;
}

.domain-card header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.domain-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.domain-card h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  word-break: break-all;
}

.status-pill {
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.status-pill.verified {
  background: rgba(34, 197, 94, 0.18);
  color: #bbf7d0;
}

.status-pill.pending,
.status-pill.unverified {
  background: rgba(234, 179, 8, 0.18);
  color: #fde68a;
}

.status-pill.failed {
  background: rgba(248, 113, 113, 0.2);
  color: #fecaca;
}

.icon-delete {
  border: none;
  background: rgba(248, 113, 113, 0.16);
  color: #fecaca;
  width: 34px;
  height: 34px;
  border-radius: 0.75rem;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.icon-delete:hover {
  background: rgba(248, 113, 113, 0.26);
  color: #fff;
  transform: translateY(-1px);
}

.meta {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}

.meta li {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.75);
}

.meta-label {
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
}

.events-count {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.domain-card footer {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.domain-card footer span {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialog-body {
  display: grid;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.6;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.button-verify {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(99, 102, 241, 0.16);
  color: #c7d2fe;
  border-radius: 0.75rem;
  padding: 0.65rem 1.1rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.button-verify:hover {
  background: rgba(99, 102, 241, 0.28);
  color: #fff;
  transform: translateY(-1px);
}

.button-verify:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

.banner-success {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.35);
  color: #bbf7d0;
}

.banner-error {
  background: rgba(248, 113, 113, 0.16);
  border: 1px solid rgba(248, 113, 113, 0.36);
  color: #fecaca;
}

.muted {
  color: rgba(255, 255, 255, 0.5);
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

.dialog-card-large {
  width: min(800px, 100%);
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

.dialog-form input[type="url"],
.dialog-form input[type="text"] {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.85rem;
  padding: 0.85rem 1rem;
  color: #fff;
}

.dialog-form input:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.55);
}

.events-selection {
  display: grid;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.event-checkbox {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background 0.2s ease;
}

.event-checkbox:hover {
  background: rgba(255, 255, 255, 0.05);
}

.event-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #6366f1;
}

.event-checkbox span {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  user-select: none;
}

.event-label {
  position: absolute;
  left: 0;
  top: 0;
  padding-left: 40px;
  padding-top: 11px;
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

.button-secondary {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  border-radius: 0.75rem;
  padding: 0.75rem 1.2rem;
  cursor: pointer;
}

.button-primary {
  border: none;
  border-radius: 0.75rem;
  padding: 0.75rem 1.2rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.button-primary:disabled,
.button-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.webhook-details {
  display: grid;
  gap: 1.5rem;
}

.detail-row {
  display: grid;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 600;
}

.detail-value {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
  word-break: break-all;
}

.detail-value code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  display: inline-block;
}

.events-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.event-tag {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 0.5rem;
  background: rgba(99, 102, 241, 0.2);
  color: #c7d2fe;
  font-size: 0.8rem;
  font-weight: 500;
}

.event-tag.empty {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.attempts-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.attempts-heading {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.attempts-loading,
.attempts-empty {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
}

.attempts-table-container {
  position: relative;
  max-height: 200px;
  overflow-y: auto;
}

.attempts-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.attempts-table thead {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.attempts-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.attempts-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.85);
}

.attempts-table tbody tr:last-child td {
  border-bottom: none;
}

.attempts-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.attempt-event {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.25rem 0.5rem;
  border-radius: 0.4rem;
  color: rgba(255, 255, 255, 0.9);
}

.attempt-status {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.attempt-status.success {
  background: rgba(34, 197, 94, 0.2);
  color: #bbf7d0;
}

.attempt-status.client-error {
  background: rgba(234, 179, 8, 0.18);
  color: #fde68a;
}

.attempt-status.server-error {
  background: rgba(248, 113, 113, 0.2);
  color: #fecaca;
}

.attempt-status.unknown {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

.attempt-error {
  color: #fecaca;
  font-size: 0.85rem;
  word-break: break-word;
}

.attempt-success {
  color: #bbf7d0;
  font-size: 0.85rem;
}

@media (max-width: 780px) {
  .page-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .dialog-card-large {
    width: min(95vw, 100%);
  }

  .domain-card footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .attempts-table {
    font-size: 0.8rem;
  }

  .attempts-table th,
  .attempts-table td {
    padding: 0.6rem 0.75rem;
  }
}
</style>

