import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

interface Organization {
  _id?: string;
  name?: string;
  [key: string]: unknown;
}

interface AuthUser {
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  organizations?: Organization[];
  [key: string]: unknown;
}

const tokenState = ref<string | null>(null);
const userState = ref<AuthUser | null>(null);
const organizationIdState = ref<string | null>(null);
const loadingState = ref(false);
let fetchPromise: Promise<void> | null = null;

const readCookie = (name: string) => {
  if (typeof document === 'undefined') {
    return null;
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1] ?? '') : null;
};

const getApiUrl = () => {
  const config = useRuntimeConfig();

  return config.public.apiUrl;
};

const clearSessionAndRedirect = (router: ReturnType<typeof useRouter>) => {
  tokenState.value = null;
  userState.value = null;
  organizationIdState.value = null;

  if (typeof document !== 'undefined') {
    document.cookie = 'sendook_token=; Max-Age=0; path=/; SameSite=Lax';
  }

  router.replace('/login');
};

const fetchUser = async (router: ReturnType<typeof useRouter>) => {
  if (!tokenState.value) {
    return;
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  loadingState.value = true;

  fetchPromise = (async () => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/user`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokenState.value}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load user: ${response.status}`);
      }

      const data = (await response.json()) as AuthUser;
      userState.value = data;

      const organizations = Array.isArray(data?.organizations) ? data.organizations : [];
      organizationIdState.value = organizations.length > 0 ? organizations[0]?._id ?? null : null;
    } catch (error) {
      console.error('Unable to load Sendook user session', error);
      clearSessionAndRedirect(router);
    } finally {
      loadingState.value = false;
      fetchPromise = null;
    }
  })();

  return fetchPromise;
};

export function useRequireAuth() {
  const router = useRouter();

  const ensureAuth = async () => {
    tokenState.value = readCookie('sendook_token');

    if (!tokenState.value) {
      clearSessionAndRedirect(router);
      return;
    }

    if (!userState.value) {
      await fetchUser(router);
    }
  };

  onMounted(() => {
    void ensureAuth();
  });

  return {
    token: tokenState,
    user: userState,
    organizationId: organizationIdState,
    loading: loadingState,
    refreshUser: () => fetchUser(router)
  };
}

