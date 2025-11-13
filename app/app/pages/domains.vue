<template>
  <DashboardShell>
    <template #header>
      <div class="page-heading">
        <div>
          <h1>Domains</h1>
          <p>Connect sending domains, verify DNS, and monitor reputation with automated health checks.</p>
        </div>
        <button class="primary-action" type="button" @click="openCreateDialog">
          <span>Add domain</span>
        </button>
      </div>
    </template>

    <section v-if="loading" class="placeholder-card">
      <h2>Loading domains…</h2>
      <p>We are fetching your verified and pending sending domains.</p>
    </section>

    <template v-else>
      <div v-if="verificationMessage" class="banner banner-success">
        {{ verificationMessage }}
      </div>
      <div v-if="verificationError" class="banner banner-error" role="alert">
        {{ verificationError }}
      </div>

      <section v-if="domains.length === 0" class="placeholder-card">
        <h2>Connect your sending domain</h2>
        <p>
          Domains will appear here once they are verified. Add DNS records provided by Sendook to unlock
          DKIM, SPF, and custom tracking support.
        </p>
      </section>

      <section v-else class="domains-grid">
        <article v-for="domain in domains" :key="domain._id ?? domain.name" class="domain-card">
          <header>
            <div class="domain-heading flex items-center gap-2 w-full">
              <h3 class="flex-1">{{ domain.name }}</h3>
              <button
                type="button"
                class="icon-delete"
                aria-label="Delete domain"
                @click="openDeleteDialog(domain)"
              >
                ×
              </button>
            </div>
          </header>
          <ul class="meta">
            <li>
              <span class="meta-label">Created</span>
              <span>{{ formatDate(domain.createdAt) }}</span>
            </li>
            <li>
              <span class="meta-label">Status</span>
              <span :class="['status-pill', domain.verified ? 'verified' : 'pending']">
                {{ (domain.verified ? 'verified' : 'pending').toUpperCase() }}
              </span>
            </li>
          </ul>
          <footer v-if="!domain.verified">
            <span>{{ domain.verified ? 'Verified' : 'DNS pending verification' }}</span>
            <button
              type="button"
              class="button-verify"
              :disabled="verifyingId === (domain.name ?? domain._id ?? '')"
              @click="handleVerifyDomain(domain)"
            >
              <span v-if="verifyingId === (domain.name ?? domain._id ?? '')">Verifying…</span>
              <span v-else>Verify DNS</span>
            </button>
          </footer>
        </article>
      </section>
    </template>

    <Transition name="fade">
      <div v-if="showDialog" class="dialog-backdrop" role="dialog" aria-modal="true">
        <div class="dialog-card">
          <header class="dialog-header">
            <h2>Add domain</h2>
            <button type="button" class="icon-close" aria-label="Close" @click="closeCreateDialog">
              ×
            </button>
          </header>
          <form class="dialog-form" @submit.prevent="handleCreateDomain">
            <label>
              <span>Domain</span>
              <input
                v-model="form.name"
                type="text"
                placeholder="example.com"
                required
                :disabled="saving">
            </label>

            <p v-if="errorMessage" class="dialog-error" role="alert">{{ errorMessage }}</p>

            <footer>
              <button type="button" class="button-secondary" :disabled="saving" @click="closeCreateDialog">
                Cancel
              </button>
              <button type="submit" class="button-primary" :disabled="saving">
                <span v-if="saving">Adding…</span>
                <span v-else>Add domain</span>
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
            <h2>Delete domain</h2>
            <button type="button" class="icon-close" aria-label="Close" @click="closeDeleteDialog">
              ×
            </button>
          </header>
          <div class="dialog-body">
            <p>
              Removing <strong>{{ pendingDelete?.name ?? 'this domain' }}</strong> will disable sending
              and tracking for addresses under it until reconnected. Continue?
            </p>
            <p v-if="deleteError" class="dialog-error" role="alert">{{ deleteError }}</p>
          </div>
          <footer class="dialog-footer">
            <button type="button" class="button-secondary" :disabled="deleting" @click="closeDeleteDialog">
              Cancel
            </button>
            <button type="button" class="button-primary" :disabled="deleting" @click="handleDeleteDomain">
              <span v-if="deleting">Deleting…</span>
              <span v-else>Delete domain</span>
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
  name: 'DomainsPage'
});

const session = useRequireAuth();
const config = useRuntimeConfig();

interface Domain {
  _id?: string;
  name?: string;
  verified?: boolean;
  createdAt?: string;
}

const domains = ref<Domain[]>([]);
const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const verifyingId = ref<string | null>(null);
const errorMessage = ref('');
const deleteError = ref('');
const verificationMessage = ref('');
const verificationError = ref('');
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const pendingDelete = ref<Domain | null>(null);
const form = reactive({
  name: ''
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

const loadDomains = async () => {
  const organizationId = session.organizationId.value;
  const token = session.token.value;

  if (!organizationId || !token) {
    return;
  }

  loading.value = true;

  try {
    const response = await fetch(`${config.public.apiUrl}/organizations/${organizationId}/domains`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Unable to fetch domains: ${response.status}`);
    }

    const data = (await response.json()) as Domain[] | { data?: Domain[] };
    domains.value = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error('Failed to load domains', error);
    errorMessage.value = 'Unable to load domains. Please try again.';
    domains.value = [];
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

const openDeleteDialog = (domain: Domain) => {
  pendingDelete.value = domain;
  deleteError.value = '';
  showDeleteDialog.value = true;
};

const closeDeleteDialog = () => {
  showDeleteDialog.value = false;
  pendingDelete.value = null;
  deleteError.value = '';
};

const handleVerifyDomain = async (domain: Domain) => {
  const organizationId = session.organizationId.value;
  const token = session.token.value;
  const domainId = domain.name ?? domain._id;

  if (!organizationId || !token || !domainId) {
    verificationError.value = 'Missing domain information. Please refresh and try again.';
    return;
  }

  verifyingId.value = domainId;
  verificationMessage.value = '';
  verificationError.value = '';

  try {
    const response = await fetch(
      `${config.public.apiUrl}/organizations/${organizationId}/domains/${domainId}/verify`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(payload.message ?? 'Unable to verify domain.');
    }

    verificationMessage.value = `Verification triggered for ${domainId}.`;
    await loadDomains();
  } catch (error) {
    if (error instanceof Error) {
      verificationError.value = error.message;
    } else {
      verificationError.value = 'Unable to verify domain. Please try again.';
    }
  } finally {
    verifyingId.value = null;
  }
};

const handleCreateDomain = async () => {
  const organizationId = session.organizationId.value;
  const token = session.token.value;

  if (!organizationId || !token) {
    errorMessage.value = 'You must be part of an organization to add a domain.';
    return;
  }

  saving.value = true;
  errorMessage.value = '';

  try {
    const response = await fetch(`${config.public.apiUrl}/organizations/${organizationId}/domains`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: form.name,
      })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(payload.message ?? 'Unable to add domain.');
    }

    await loadDomains();
    closeCreateDialog();
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = 'Unable to add domain. Please try again.';
    }
  } finally {
    saving.value = false;
  }
};

const handleDeleteDomain = async () => {
  const organizationId = session.organizationId.value;
  const token = session.token.value;
  const domainId = pendingDelete.value?._id;

  if (!organizationId || !token || !domainId) {
    deleteError.value = 'Missing domain information. Please refresh and try again.';
    return;
  }

  deleting.value = true;
  deleteError.value = '';

  try {
    const response = await fetch(`${config.public.apiUrl}/organizations/${organizationId}/domains/${domainId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(payload.message ?? 'Unable to delete domain.');
    }

    await loadDomains();
    closeDeleteDialog();
  } catch (error) {
    if (error instanceof Error) {
      deleteError.value = error.message;
    } else {
      deleteError.value = 'Unable to delete domain. Please try again.';
    }
  } finally {
    deleting.value = false;
  }
};

watch(
  () => [session.organizationId.value, session.token.value],
  ([organizationId, token]) => {
    if (organizationId && token) {
      void loadDomains();
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

.domain-card footer {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
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
  border-radius: 0.85rem;
  padding: 0.85rem 1rem;
  color: #fff;
}

.dialog-form input:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.55);
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

@media (max-width: 780px) {
  .page-heading {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

