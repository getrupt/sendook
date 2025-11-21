<script setup lang="ts">
const activeTab = ref('create')

const tabs = [
  { id: 'create', label: '1. Create Inbox', icon: 'i-lucide-inbox' },
  { id: 'send', label: '2. Send Email', icon: 'i-lucide-send' },
  { id: 'webhook', label: '3. Receive Webhook', icon: 'i-lucide-webhook' }
]

const codeExamples = {
  create: {
    title: 'Create an inbox in one line',
    code: `\`\`\`typescript
import Sendook from '@sendook/node';

const client = new Sendook('your_api_key');

// Create an inbox
const inbox = await client.inbox.create({
  name: 'Customer Support'
});

console.log(inbox.email);
// => inbox-abc123@sendook.com
\`\`\``,
    rawCode: `import Sendook from '@sendook/node';

const client = new Sendook('your_api_key');

// Create an inbox
const inbox = await client.inbox.create({
  name: 'Customer Support'
});

console.log(inbox.email);
// => inbox-abc123@yourdomain.sendook.com`,
    language: 'typescript'
  },
  send: {
    title: 'Send an email to your inbox',
    code: `\`\`\`bash
# Send from any email client
To: inbox-abc123@sendook.com
Subject: New support request
Body: I need help with my account

# Or use the API to send
await client.messages.send({
  from: inbox.email,
  to: 'customer@example.com',
  subject: 'Re: New support request',
  body: 'How can we help you?'
});
\`\`\``,
    rawCode: `# Send from any email client
To: inbox-abc123@sendook.com
Subject: New support request
Body: I need help with my account

# Or use the API to send
await client.messages.send({
  from: inbox.email,
  to: 'customer@example.com',
  subject: 'Re: New support request',
  body: 'How can we help you?'
});`,
    language: 'bash'
  },
  webhook: {
    title: 'Receive instant webhook notifications',
    code: `\`\`\`json
{
  "event": "message.received",
  "inbox_id": "inbox_abc123",
  "message": {
    "id": "msg_xyz789",
    "from": "customer@example.com",
    "to": "inbox-abc123@sendook.com",
    "subject": "New support request",
    "body": "I need help with my account",
    "attachments": [],
    "received_at": "2025-11-16T10:30:00Z"
  }
}
\`\`\``,
    rawCode: `{
  "event": "message.received",
  "inbox_id": "inbox_abc123",
  "message": {
    "id": "msg_xyz789",
    "from": "customer@example.com",
    "to": "inbox-abc123@sendook.com",
    "subject": "New support request",
    "body": "I need help with my account",
    "attachments": [],
    "received_at": "2025-11-16T10:30:00Z"
  }
}`,
    language: 'json'
  }
}

const currentExample = computed(() => codeExamples[activeTab.value as keyof typeof codeExamples])

function copyToClipboard() {
  if (typeof window !== 'undefined' && window.navigator.clipboard) {
    window.navigator.clipboard.writeText(currentExample.value.rawCode)
  }
}
</script>

<template>
  <div class="relative">
    <UPageCard
      variant="subtle"
      class="rounded-2xl overflow-hidden"
    >
      <!-- Tab Navigation -->
      <div class="flex items-center gap-2 border-b border-gray-200 px-4 py-3 bg-white">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          :class="[
            activeTab === tab.id
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >
          <UIcon :name="tab.icon" class="w-4 h-4" />
          <span class="hidden sm:inline">{{ tab.label }}</span>
          <span class="sm:hidden">{{ tab.id === 'create' ? '1' : tab.id === 'send' ? '2' : '3' }}</span>
        </button>
      </div>

      <!-- Code Display -->
      <div class="relative">
        <div class="absolute top-4 right-4 z-10">
          <UButton
            icon="i-lucide-copy"
            size="xs"
            color="neutral"
            variant="subtle"
            @click="copyToClipboard"
          />
        </div>

        <div class="p-6 bg-gray-50">
          <div class="mb-3">
            <p class="text-sm font-medium text-gray-700">
              {{ currentExample.title }}
            </p>
          </div>

          <div class="code-wrapper bg-white rounded-lg border border-gray-200 overflow-hidden">
            <MDC :value="currentExample.code" tag="div" class="code-block" />
          </div>
        </div>
      </div>

      <!-- Visual Indicator -->
      <div class="px-6 py-4 bg-white border-t border-gray-200">
        <div class="flex items-center gap-2 text-xs text-gray-500">
          <UIcon name="i-lucide-sparkles" class="w-3.5 h-3.5 text-primary-500" />
          <span>That's it! Email infrastructure in minutes, not days.</span>
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

/* Smooth transitions for tab switching */
button {
  transition: all 0.2s ease;
}
</style>
