<script setup lang="ts">
const activeTab = ref('create')

const tabs = [
  { id: 'create', label: '1. Create Inbox', icon: 'i-lucide-inbox' },
  { id: 'send', label: '2. Send Email', icon: 'i-lucide-send' },
  { id: 'webhook', label: '3. Receive Email', icon: 'i-lucide-webhook' }
]

const codeExamples = {
  create: {
    title: 'Create an inbox in one line',
    code: `\`\`\`typescript
import Sendook from '@sendook/node';

const client = new Sendook('SENDOOK_API_KEY');

const inbox = await client.inbox.create();
\`\`\``,
    rawCode: `import Sendook from '@sendook/node';

const client = new Sendook('SENDOOK_API_KEY');

const inbox = await client.inbox.create();
`,
    language: 'typescript',
    api: {
      url: '/docs/api/inboxes#create-an-inbox'
    }
  },
  send: {
    title: 'Send an email',
    code: `\`\`\`typescript
import Sendook from '@sendook/node';

const client = new Sendook('SENDOOK_API_KEY');

const inbox = await client.inbox.create();

await client.messages.send({
  inboxId: inbox.id,
  to: ['customer@example.com'],
  subject: 'Re: New support request',
  text: 'How can we help you?',
  html: '<p>How can we help you?</p>'
});
\`\`\``,
    rawCode: `import Sendook from '@sendook/node';

const client = new Sendook('SENDOOK_API_KEY');

const inbox = await client.inbox.create();

await client.messages.send({
  inboxId: inbox.id,
  to: ['customer@example.com'],
  subject: 'Re: New support request',
  text: 'How can we help you?',
  html: '<p>How can we help you?</p>'
});`,
    language: 'typescript',
    api: {
      url: '/docs/api/messages#send-a-message'
    }
  },
  webhook: {
    title: 'Receive emails via webhook',
    code: `\`\`\`typescript
import Sendook from '@sendook/node';

const client = new Sendook('SENDOOK_API_KEY');

await client.webhook.create({
  url: 'https://your-app.com/webhooks/email',
  events: ['message.received']
});
\`\`\``,
    rawCode: `{
  "event": "message.received",
  "inbox_id": "inbox_abc123",
  "message": {
    "id": "msg_xyz789",
    "from": "customer@example.com",
    "to": "inbox-abc123@sendook.com",
    "subject": "New support request",
    "text": "I need help with my account",
    "html": "<p>I need help with my account</p>",
    "attachments": [],
    "received_at": "2025-11-16T10:30:00Z"
  }
}`,
    language: 'json',
    api: {
      url: '/docs/api/webhooks#create-a-webhook'
    }
  }
}

const currentExample = computed(() => codeExamples[activeTab.value as keyof typeof codeExamples])
</script>

<template>
  <div class="relative">
    <UPageCard
      variant="subtle"
      class="rounded-2xl overflow-hidden"
    >
      <!-- Tab Navigation -->
      <div class="flex items-center gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
          :class="[
            activeTab === tab.id
              ? 'bg-primary-500 text-white shadow-sm'
              : 'bg-white text-gray-600'
          ]"
          @click="activeTab = tab.id"
        >
          <UIcon
            :name="tab.icon"
            class="w-4 h-4"
          />
          <span class="hidden sm:inline">{{ tab.label }}</span>
          <span class="sm:hidden">{{ tab.id === 'create' ? '1' : tab.id === 'send' ? '2' : '3' }}</span>
        </button>
      </div>

      <!-- Code Display -->
      <div class="relative">
        <div class="bg-gray-50">
          <div class="">
            <p class="text-sm font-medium text-gray-700">
              {{ currentExample.title }}
            </p>
          </div>

          <MDC
            :value="currentExample.code"
            :language="currentExample.language"
            tag="div"
            class="code-block m-0"
          />
        </div>
      </div>
    </UPageCard>
  </div>
</template>

<style>
/* Code block styling */
.code-wrapper :deep(pre) {
  margin: 0 !important;
  padding: 1rem !important;
  background: transparent !important;
  border-radius: 0 !important;
  border: none !important;
  font-size: 13px !important;
  line-height: 1.6 !important;
  overflow-x: auto;
}

.code-wrapper :deep(code) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
  font-size: 13px !important;
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
}

.code-wrapper :deep(.shiki) {
  border: none !important;
  background: transparent !important;
}

.code-block {
  font-size: 13px;
}

.code-block > * {
  margin: 10px 0 0 0;
}

.code-block > * > * {
  background: rgba(0, 0, 0, 0.8);
}

/* Smooth transitions for tab switching */
button {
  transition: all 0.2s ease;
}
</style>
