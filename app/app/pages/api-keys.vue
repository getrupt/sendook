<template>
  <DashboardShell>
    <template #header>
      <div class="page-heading">
        <div>
          <h1>API Keys</h1>
          <p>Manage credentials for sending, environment separation, and service-to-service access.</p>
        </div>
        <button class="primary-action" type="button" @click="openCreateDialog">
          <span>Generate key</span>
        </button>
      </div>
    </template>

    <section v-if="loading" class="placeholder-card">
      <h2>Loading keys…</h2>
      <p>Give us a moment while we locate your existing API credentials.</p>
    </section>

    <section v-else-if="apiKeys.length === 0" class="placeholder-card">
      <h2>No keys yet</h2>
      <p>
        API keys authenticate requests to Sendook across environments. Create your first key to obtain
        REST credentials and scopes for sending messages programmatically.
      </p>
    </section>

    <section v-else class="keys-grid">
      <article v-for="key in apiKeys" :key="key._id ?? key.name" class="key-card">
        <header>
          <div>
            <h3>{{ key.name ?? 'Unnamed key' }}</h3>
            <p class="key-prefix">{{ key._id }}</p>
          </div>
          <button
            type="button"
            class="icon-delete"
            aria-label="Delete API key"
            @click="openDeleteDialog(key)"
          >
            ×
          </button>
        </header>
        <div class="key-secret">
          <span class="secret-label">Key</span>
          <span class="secret-value">{{ key.key ?? '••••••••••••••••' }}</span>
          <button type="button" class="button-copy" aria-label="Copy API key" @click="copyKey(key)">
            <span v-if="copiedKeyId === (key._id ?? key.key)">Copied</span>
            <span v-else>Copy</span>
          </button>
        </div>
        <ul class="meta">
          <li>
            <span class="meta-label">Created</span>
            <span>{{ formatDate(key.createdAt) }}</span>
          </li>
        </ul>
      </article>
    </section>

    <Transition name="fade">
      <div v-if="showDialog" class="dialog-backdrop" role="dialog" aria-modal="true">
        <div class="dialog-card">
          <header class="dialog-header">
            <h2>Create API key</h2>
            <button type="button" class="icon-close" aria-label="Close" @click="closeCreateDialog">
              ×
            </button>
          </header>
          <form class="dialog-form" @submit.prevent="handleCreateKey">
            <label>
              <span>Name</span>
              <input v-model="form.name" type="text" required :disabled="saving">
            </label>

            <p v-if="errorMessage" class="dialog-error" role="alert">{{ errorMessage }}</p>

            <footer>
              <button type="button" class="button-secondary" :disabled="saving" @click="closeCreateDialog">
                Cancel
              </button>
              <button type="submit" class="button-primary" :disabled="saving">
                <span v-if="saving">Creating…</span>
                <span v-else>Generate key</span>
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
            <h2>Delete API key</h2>
            <button type="button" class="icon-close" aria-label="Close" @click="closeDeleteDialog">
              ×
            </button>
          </header>
          <div class="dialog-body">
            <p>
              This action revokes the key
              <strong>{{ pendingDelete?.name ?? pendingDelete?._id ?? 'Unnamed key' }}</strong>. Clients
              using it will immediately lose access. Are you sure you want to continue?
            </p>
            <p v-if="deleteError" class="dialog-error" role="alert">{{ deleteError }}</p>
          </div>
          <footer class="dialog-footer">
            <button type="button" class="button-secondary" :disabled="deleting" @click="closeDeleteDialog">
              Cancel
            </button>
            <button type="button" class="button-primary" :disabled="deleting" @click="handleDeleteKey">
              <span v-if="deleting">Deleting…</span>
              <span v-else>Delete key</span>
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </DashboardShell>
</template>

<script setup lang="ts">
import { onBeforeUnmount, reactive, ref, watch } from 'vue';

defineOptions({
  name: 'ApiKeysPage'
});

const config = useRuntimeConfig();
const session = useRequireAuth();

interface ApiKey {
  _id?: string;
  name?: string;
  key?: string;
  createdAt?: string;
}

const apiKeys = ref<ApiKey[]>([]);
const loading = ref(true);
const saving = ref(false);
const errorMessage = ref('');
const showDialog = ref(false);
const deleting = ref(false);
const showDeleteDialog = ref(false);
const deleteError = ref('');
const pendingDelete = ref<ApiKey | null>(null);
const form = reactive({
  name: ''
});
const copiedKeyId = ref<string | null>(null);
let copyTimeout: ReturnType<typeof setTimeout> | null = null;

const formatDate = (value?: string) => {
  if (!value) {
    return 'never';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'never';
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const loadKeys = async () => {
  const organizationId = session.organizationId.value;
  const token = session.token.value;

  if (!organizationId || !token) {
    return;
  }

  loading.value = true;

  try {
    const response = await fetch(`${config.public.apiUrl}/organizations/${organizationId}/api_keys`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Unable to fetch API keys: ${response.status}`);
    }

    const data = (await response.json()) as ApiKey[] | { data?: ApiKey[] };
    apiKeys.value = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error('Failed to load API keys', error);
    errorMessage.value = 'Unable to load API keys. Please try again.';
    apiKeys.value = [];
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  errorMessage.value = '';
  form.name = '';
  showDialog.value = true;
};

const closeCreateDialog = () => {
  showDialog.value = false;
};

const openDeleteDialog = (key: ApiKey) => {
  pendingDelete.value = key;
  deleteError.value = '';
  showDeleteDialog.value = true;
};

const closeDeleteDialog = () => {
  showDeleteDialog.value = false;
  pendingDelete.value = null;
  deleteError.value = '';
};

const copyKey = async (key: ApiKey) => {
  if (!key.key || typeof navigator === 'undefined' || !navigator.clipboard) {
    return;
  }

  try {
    await navigator.clipboard.writeText(key.key);
    copiedKeyId.value = key._id ?? key.key ?? null;
    if (copyTimeout) {
      clearTimeout(copyTimeout);
    }
    copyTimeout = setTimeout(() => {
      copiedKeyId.value = null;
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

const handleCreateKey = async () => {
  const organizationId = session.organizationId.value;
  const token = session.token.value;

  if (!organizationId || !token) {
    errorMessage.value = 'You must be part of an organization to create an API key.';
    return;
  }

  saving.value = true;
  errorMessage.value = '';

  try {
    const response = await fetch(`${config.public.apiUrl}/organizations/${organizationId}/api_keys`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: form.name
      })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(payload.message ?? 'Unable to create API key.');
    }

    await loadKeys();
    closeCreateDialog();
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = 'Unable to create API key. Please try again.';
    }
  } finally {
    saving.value = false;
  }
};

const handleDeleteKey = async () => {
  const organizationId = session.organizationId.value;
  const token = session.token.value;
  const keyId = pendingDelete.value?._id;

  if (!organizationId || !token || !keyId) {
    deleteError.value = 'Missing key information. Please refresh and try again.';
    return;
  }

  deleting.value = true;
  deleteError.value = '';

  try {
    const response = await fetch(`${config.public.apiUrl}/organizations/${organizationId}/api_keys/${keyId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(payload.message ?? 'Unable to delete API key.');
    }

    await loadKeys();
    closeDeleteDialog();
  } catch (error) {
    if (error instanceof Error) {
      deleteError.value = error.message;
    } else {
      deleteError.value = 'Unable to delete API key. Please try again.';
    }
  } finally {
    deleting.value = false;
  }
};

watch(
  () => [session.organizationId.value, session.token.value],
  ([organizationId, token]) => {
    if (organizationId && token) {
      void loadKeys();
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

.keys-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.key-card {
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(12, 12, 18, 0.6);
  padding: 1.75rem;
  display: grid;
  gap: 1.5rem;
}

.key-card header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.key-card h3 {
  margin: 0 0 0.3rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.key-prefix {
  margin: 0;
  font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.65);
}

.key-env {
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  background: rgba(59, 130, 246, 0.18);
  color: #bfdbfe;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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

.key-card footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

.muted {
  color: rgba(255, 255, 255, 0.5);
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

.dialog-form input,
.dialog-form select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.5rem;
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
  margin-left: 1rem;
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

@media (max-width: 780px) {
  .page-heading {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

