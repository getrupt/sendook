import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

export function useRequireAuth() {
  const router = useRouter();
  const token = ref<string | null>(null);

  const readCookie = (name: string) => {
    if (typeof document === 'undefined') {
      return null;
    }
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1] ?? '') : null;
  };

  onMounted(() => {
    token.value = readCookie('sendook_token');
    if (!token.value) {
      router.replace('/login');
    }
  });

  return {
    token
  };
}

