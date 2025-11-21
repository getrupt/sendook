<template>
  <DashboardShell>
    <template #header>
      <div class="page-heading">
        <div>
          <h1>Inboxes</h1>
          <p>Configure inbound routes, relay addresses, and forwarding rules for your domains.</p>
        </div>
        <button class="primary-action" type="button" @click="openCreateDialog">
          <span>New inbox</span>
        </button>
      </div>
    </template>

    <section v-if="loading" class="placeholder-card">
      <h2>Loading inboxes…</h2>
      <p>Please hold on while we fetch your workspace inboxes.</p>
    </section>

    <section v-else-if="inboxes.length === 0" class="placeholder-card">
      <h2>Build your first inbox</h2>
      <p>
        Inboxes let you capture replies, route notifications, and monitor support channels. Once you
        add an inbox, it will appear here with its routing configuration.
      </p>
    </section>

    <section v-else class="inboxes-grid">
      <article v-for="inbox in inboxes" :key="inbox._id ?? inbox.name" class="inbox-card">
        <header>
          <div class="inbox-heading flex items-center gap-2 w-full">
            <h3 class="flex-1">{{ inbox.name ?? 'Unnamed inbox' }}</h3>
            <button
              type="button"
              class="icon-delete"
              aria-label="Delete inbox"
              @click="openDeleteDialog(inbox)"
            >
              ×
            </button>
          </div>
        </header>
        <p class="inbox-address">
          {{ inbox.email ?? inbox.address ?? 'Generated on first reply' }}
        </p>
        <div class="key-secret">
          <span class="secret-label">ID</span>
          <span class="secret-value">{{ inbox._id ?? '••••••••••••••••' }}</span>
          <button type="button" class="button-copy" aria-label="Copy API key" @click="copyInboxId(inbox)">
            <span v-if="copiedInboxId === (inbox._id ?? inbox.email)">Copied</span>
            <span v-else>Copy</span>
          </button>
        </div>
        <footer>
          <span>Created {{ formatDate(inbox.createdAt) }}</span>
          <span v-if="inbox.status" class="status">
            {{ inbox.status }}
          </span>
          <NuxtLink :to="`/inbox/${inbox._id ?? inbox.name}`" class="button-secondary">
            View
          </NuxtLink>
        </footer>
      </article>
    </section>

    <Transition name="fade">
      <div v-if="showDialog" class="dialog-backdrop" role="dialog" aria-modal="true">
        <div class="dialog-card">
          <header class="dialog-header">
            <h2>Create inbox</h2>
            <button type="button" class="icon-close" aria-label="Close" @click="closeCreateDialog">
              ×
            </button>
          </header>
          <form class="dialog-form" @submit.prevent="handleCreateInbox">
            <label>
              <span>Display name</span>
              <input v-model="form.displayName" type="text" required :disabled="saving">
            </label>

            <label>
              <span>Email address (optional)</span>
              <input
                v-model="form.email"
                type="email"
                placeholder="support@sendook.dev"
                :disabled="saving">
            </label>

            <p v-if="errorMessage" class="dialog-error" role="alert">{{ errorMessage }}</p>

            <footer>
              <button type="button" class="button-secondary" :disabled="saving" @click="closeCreateDialog">
                Cancel
              </button>
              <button type="submit" class="button-primary" :disabled="saving">
                <span v-if="saving">Creating…</span>
                <span v-else>Create inbox</span>
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
            <h2>Delete inbox</h2>
            <button type="button" class="icon-close" aria-label="Close" @click="closeDeleteDialog">
              ×
            </button>
          </header>
          <div class="dialog-body">
            <p>
              Inbox
              <strong>{{ pendingDelete?.name ?? pendingDelete?.email ?? 'Unnamed inbox' }}</strong> will
              be removed. Any routing linked to it will stop working. Do you want to continue?
            </p>
            <p v-if="deleteError" class="dialog-error" role="alert">{{ deleteError }}</p>
          </div>
          <footer class="dialog-footer">
            <button type="button" class="button-secondary" :disabled="deleting" @click="closeDeleteDialog">
              Cancel
            </button>
            <button type="button" class="button-primary" :disabled="deleting" @click="handleDeleteInbox">
              <span v-if="deleting">Deleting…</span>
              <span v-else>Delete inbox</span>
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
  name: 'InboxesPage'
});

const session = useRequireAuth();
const config = useRuntimeConfig();

interface Inbox {
  _id?: string;
  name?: string;
  email?: string;
  address?: string;
  type?: string;
  status?: string;
  createdAt?: string;
}

const inboxes = ref<Inbox[]>([]);
const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const errorMessage = ref('');
const deleteError = ref('');
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const pendingDelete = ref<Inbox | null>(null);
const form = reactive({
  displayName: '',
  email: ''
});
const copiedInboxId = ref<string | null>(null);
let copyTimeout: ReturnType<typeof setTimeout> | null = null;

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

const copyInboxId = async (inbox: Inbox) => {
  if (!inbox._id || typeof navigator === 'undefined' || !navigator.clipboard) {
    return;
  }

  try {
    await navigator.clipboard.writeText(inbox._id);
    copiedInboxId.value = inbox._id ?? null;
    if (copyTimeout) {
      clearTimeout(copyTimeout);
    }
    copyTimeout = setTimeout(() => {
      copiedInboxId.value = null;
      copyTimeout = null;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy API key', error);
  }
};

onBeforeUnmount(() => {
  if (copyTimeout) {
    clearTimeout(copyTimeout);
  }
});

const loadInboxes = async () => {
  const organizationId = session.organizationId.value;
  const token = session.token.value;

  if (!organizationId || !token) {
    return;
  }

  loading.value = true;

  try {
    const response = await fetch(`${config.public.apiUrl}/organizations/${organizationId}/inboxes`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Unable to fetch inboxes: ${response.status}`);
    }

    const data = (await response.json()) as Inbox[] | { data?: Inbox[] };
    inboxes.value = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error('Failed to load inboxes', error);
    errorMessage.value = 'Unable to load inboxes. Please try again.';
    inboxes.value = [];
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  errorMessage.value = '';
  form.displayName = '';
  form.email = '';
  showDialog.value = true;
};

const closeCreateDialog = () => {
  showDialog.value = false;
};

const openDeleteDialog = (inbox: Inbox) => {
  pendingDelete.value = inbox;
  deleteError.value = '';
  showDeleteDialog.value = true;
};

const closeDeleteDialog = () => {
  showDeleteDialog.value = false;
  pendingDelete.value = null;
  deleteError.value = '';
};

const handleCreateInbox = async () => {
  const organizationId = session.organizationId.value;
  const token = session.token.value;

  if (!organizationId || !token) {
    errorMessage.value = 'You must be part of an organization to create an inbox.';
    return;
  }

  saving.value = true;
  errorMessage.value = '';

  try {
    const response = await fetch(`${config.public.apiUrl}/organizations/${organizationId}/inboxes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: form.displayName,
        email: form.email || undefined
      })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(payload.message ?? 'Unable to create inbox.');
    }

    await loadInboxes();
    closeCreateDialog();
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = 'Unable to create inbox. Please try again.';
    }
  } finally {
    saving.value = false;
  }
};

const handleDeleteInbox = async () => {
  const organizationId = session.organizationId.value;
  const token = session.token.value;
  const inboxId = pendingDelete.value?._id;

  if (!organizationId || !token || !inboxId) {
    deleteError.value = 'Missing inbox information. Please refresh and try again.';
    return;
  }

  deleting.value = true;
  deleteError.value = '';

  try {
    const response = await fetch(`${config.public.apiUrl}/organizations/${organizationId}/inboxes/${inboxId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(payload.message ?? 'Unable to delete inbox.');
    }

    await loadInboxes();
    closeDeleteDialog();
  } catch (error) {
    if (error instanceof Error) {
      deleteError.value = error.message;
    } else {
      deleteError.value = 'Unable to delete inbox. Please try again.';
    }
  } finally {
    deleting.value = false;
  }
};

watch(
  () => [session.organizationId.value, session.token.value],
  ([organizationId, token]) => {
    if (organizationId && token) {
      void loadInboxes();
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
  border-radius: 0.5rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  background: rgba(255, 195, 1, 0.2);
  color: rgba(255, 195, 1, 1);
  cursor: pointer;
}

.primary-action:hover {
  background: rgba(255, 195, 1, 0.35);
}

.inboxes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
  max-width: calc(3 * 1fr + 3 * 1.5rem);
  grid-template-columns: repeat(3, 1fr);
}
@media (max-width: 1100px) {
  .inboxes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 700px) {
  .inboxes-grid {
    grid-template-columns: 1fr;
  }
}

.inbox-card {
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(12, 12, 18, 0.6);
  padding: 1.75rem;
  display: grid;
  gap: 1.25rem;
}

.inbox-card header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.inbox-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-delete {
  border: none;
  background: rgba(248, 113, 113, 0.16);
  color: #fecaca;
  width: 34px;
  height: 34px;
  border-radius: 0.4rem;
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

.inbox-card h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.inbox-tag {
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  background: rgba(99, 102, 241, 0.18);
  color: #c7d2fe;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.inbox-address {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.95rem;
  word-break: break-word;
}

.inbox-card footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  gap: 1rem;
}

.status {
  text-transform: capitalize;
}

.placeholder-card {
  text-align: left;
  padding: 3rem;
  border-radius: 1rem;
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
  border-radius: 1rem;
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

.dialog-form input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.5rem;
  padding: 0.85rem 1rem;
  color: #fff;
}

.dialog-form input:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.55);
}

.dialog-error {
  border-radius: 0.5rem;
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

.button-secondary {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  border-radius: 0.4rem;
  padding: 0.75rem 1.2rem;
  cursor: pointer;
}

.button-primary {
  border: none;
  border-radius: 0.4rem;
  padding: 0.75rem 1.2rem;
  background: linear-gradient(135deg, #ffd154 0%, #ffc301 100%);
  color: #000;
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

.key-secret {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(15, 15, 25, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 0.9rem;
  padding: 0.75rem 1rem;
  max-width: 300px;
}

.secret-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.secret-value {
  flex: 1;
  font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.button-copy {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.85);
  border-radius: 0.4rem;
  padding: 0.45rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.button-copy:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

@media (max-width: 780px) {
  .page-heading {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

