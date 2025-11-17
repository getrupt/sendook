<template>
  <div class="auth-container">
    <h2 class="auth-title">Welcome back</h2>
    <p class="auth-subtitle">Access your Sendook dashboard to manage transactional email.</p>

    <form class="auth-form" @submit.prevent="handleSubmit">
      <label class="form-field">
        <span>Email</span>
        <input
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          required
          :disabled="loading"
          placeholder="alan.turing@example.com"
        />
      </label>

      <label class="form-field">
        <span>Password</span>
        <input
          v-model="password"
          type="password"
          name="password"
          autocomplete="current-password"
          required
          :disabled="loading"
          placeholder="••••••••"
        />
      </label>

      <p v-if="errorMessage" class="error-message" role="alert">
        {{ errorMessage }}
      </p>

      <button class="submit-button" type="submit" :disabled="loading">
        <span v-if="loading">Signing in...</span>
        <span v-else>Sign in</span>
      </button>
    </form>

    <p class="auth-footer">
      New to Sendook?
      <NuxtLink to="https://app.sendook.com/signup">Create an account</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  pageTransition: {
    name: 'fade',
    mode: 'out-in'
  }
});

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const config = useRuntimeConfig();

const handleSubmit = async () => {
  if (loading.value) {
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await $fetch<{ token?: string }>(`${config.public.apiUrl}/auth/login`, {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    });

    if (!response?.token) {
      throw new Error('Login failed. Token not provided.');
    }

    const tokenCookie = useCookie('sendook_token', {
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax'
    });

    tokenCookie.value = response.token;
    await navigateTo('/inboxes');
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'data' in error) {
      const fetchError = error as { data?: { message?: string } };
      errorMessage.value = fetchError.data?.message ?? 'Unable to sign in. Please try again.';
    } else if (error instanceof Error) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = 'Unable to sign in. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 360px;
  margin: 0 auto;
}

.auth-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.auth-subtitle {
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 2rem;
  line-height: 1.5;
}

.auth-form {
  display: grid;
  gap: 1.25rem;
}

.form-field {
  display: grid;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
}

.form-field input {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.85rem;
  padding: 0.9rem 1rem;
  color: #f5f7fa;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.form-field input:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.7);
  background: rgba(255, 255, 255, 0.08);
}

.form-field input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-button {
  margin-top: 1rem;
  width: 100%;
  padding: 0.95rem;
  border-radius: 0.9rem;
  border: none;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.submit-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 15px 35px rgba(99, 102, 241, 0.35);
}

.submit-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.error-message {
  padding: 0.85rem 1rem;
  border-radius: 0.85rem;
  background: rgba(248, 113, 113, 0.14);
  border: 1px solid rgba(248, 113, 113, 0.4);
  color: #fecaca;
  font-size: 0.9rem;
}

.auth-footer {
  margin-top: 1.75rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.65);
  text-align: center;
}

.auth-footer a {
  color: #a5b4fc;
  text-decoration: none;
  font-weight: 600;
}
</style>

