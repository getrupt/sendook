# Sendook Node.js SDK

Official Node.js SDK for the Sendook API. Send and receive emails programmatically with ease.

## Installation

```bash
npm install @sendook/node
# or
yarn add @sendook/node
# or
pnpm add @sendook/node
```

## Quick Start

```ts
import Sendook from "@sendook/node";

const sendook = new Sendook(process.env.SENDOOK_API_KEY);

// Create an inbox
const inbox = await sendook.inbox.create({
  name: "My Inbox",
});

// Send an email
const message = await sendook.inbox.message.send({
  inboxId: inbox.id,
  to: ["recipient@example.com"],
  subject: "Hello from Sendook",
  text: "This is a plain text email.",
  html: "<p>This is an HTML email.</p>",
});
```

## Authentication

Get your API key from the [Sendook dashboard](https://sendook.com). Set it as an environment variable:

```env
SENDOOK_API_KEY=your_api_key_here
```

```ts
import Sendook from "@sendook/node";

// Using environment variable
const sendook = new Sendook(process.env.SENDOOK_API_KEY);

// Or pass directly
const sendook = new Sendook("your_api_key_here");

// Custom API URL (for development/testing)
const sendook = new Sendook("your_api_key_here", "https://api-staging.sendook.com");
```

## API Keys

Manage your API keys programmatically.

### Create an API Key

```ts
const apiKey = await sendook.apiKey.create({
  name: "Production Integration",
});

console.log(apiKey.id); // Store this securely
```

### List API Keys

```ts
const apiKeys = await sendook.apiKey.list();

apiKeys.forEach((key) => {
  console.log(`${key.name}: ${key.id}`);
  if (key.revokedAt) {
    console.log(`  Revoked at: ${key.revokedAt}`);
  }
});
```

### Get an API Key

```ts
const apiKey = await sendook.apiKey.get({
  apiKeyId: "key_01J3Z7VMX8P4V5AQ94TZ8X6N7J",
});

console.log(apiKey);
```

### Delete an API Key

```ts
await sendook.apiKey.delete({
  apiKeyId: "key_01J3Z7VMX8P4V5AQ94TZ8X6N7J",
});
```

## Domains

Register and verify custom sending domains.

### Create a Domain

```ts
const domain = await sendook.domain.create({
  name: "agents.example.com",
});

console.log(`Domain created: ${domain.name}`);
console.log(`Verification status: ${domain.verified}`);
```

### Get Domain Details

```ts
const domain = await sendook.domain.get({
  domainId: "dom_01J3ZG3A4E6R5ZXC9HKN3S4TBQ",
});

if (domain.verified) {
  console.log("Domain is verified and ready to send!");
} else {
  console.log("Domain verification pending");
}
```

### Get DNS Records

```ts
const dnsRecords = await sendook.domain.dns({
  domainId: "dom_01J3ZG3A4E6R5ZXC9HKN3S4TBQ",
});

dnsRecords.forEach((record) => {
  console.log(`${record.type} ${record.name} = ${record.value}`);
  // Example: MX @ = inbound-smtp.us-east-2.amazonaws.com
});
```

### Verify Domain

```ts
// After configuring DNS records, trigger verification
const verifiedDomain = await sendook.domain.verify({
  domainId: "dom_01J3ZG3A4E6R5ZXC9HKN3S4TBQ",
});

if (verifiedDomain.verified) {
  console.log("Domain verified successfully!");
}
```

### Delete a Domain

```ts
await sendook.domain.delete({
  domainId: "dom_01J3ZG3A4E6R5ZXC9HKN3S4TBQ",
});
```

## Inboxes

Create and manage inboxes for sending and receiving emails.

### Create an Inbox

```ts
// Create with auto-generated email
const inbox = await sendook.inbox.create({
  name: "Customer Support Bot",
});

console.log(`Inbox created: ${inbox.email}`);

// Create with custom email (requires verified domain)
const customInbox = await sendook.inbox.create({
  name: "Sales Team",
  email: "sales@agents.example.com",
});
```

### List Inboxes

```ts
const inboxes = await sendook.inbox.list();

inboxes.forEach((inbox) => {
  console.log(`${inbox.name} - ${inbox.email}`);
});
```

### Get Inbox Details

```ts
const inbox = await sendook.inbox.get("ibox_01J3ZKZ0BRQ9SSJK1GRSCX4N4Z");

console.log(inbox);
```

### Delete an Inbox

```ts
await sendook.inbox.delete("ibox_01J3ZKZ0BRQ9SSJK1GRSCX4N4Z");
```

## Messages

Send, reply, and manage messages.

### Send a Message

```ts
const message = await sendook.inbox.message.send({
  inboxId: "ibox_01J3ZKZ0BRQ9SSJK1GRSCX4N4Z",
  to: ["customer@example.com"],
  cc: ["manager@example.com"],
  bcc: ["archive@example.com"],
  subject: "Welcome to Sendook",
  text: "Welcome! We're excited to have you on board.",
  html: "<h1>Welcome!</h1><p>We're excited to have you on board.</p>",
  labels: ["welcome", "automated"],
});

console.log(`Message sent: ${message.id}`);
```

### Send a Message with Attachments

```ts
import fs from "fs";

// Read file and encode as base64
const fileContent = fs.readFileSync("document.pdf");
const base64Content = fileContent.toString("base64");

const message = await sendook.inbox.message.send({
  inboxId: "ibox_01J3ZKZ0BRQ9SSJK1GRSCX4N4Z",
  to: ["recipient@example.com"],
  subject: "Document attached",
  text: "Please find the attached document.",
  html: "<p>Please find the attached document.</p>",
  attachments: [
    {
      content: base64Content,
      name: "document.pdf",
      contentType: "application/pdf",
    },
  ],
});
```

### Reply to a Message

```ts
const reply = await sendook.inbox.message.reply({
  inboxId: "ibox_01J3ZKZ0BRQ9SSJK1GRSCX4N4Z",
  messageId: "msg_01J3ZN9SB2M5MHF5C2QBP4DT78",
  text: "Thanks for reaching out! We'll get back to you soon.",
  html: "<p>Thanks for reaching out! We'll get back to you soon.</p>",
});

console.log(`Reply sent: ${reply.id}`);
```

### List Messages

```ts
// List all messages in an inbox
const messages = await sendook.inbox.message.list(
  "ibox_01J3ZKZ0BRQ9SSJK1GRSCX4N4Z"
);

// Search messages
const searchResults = await sendook.inbox.message.list(
  "ibox_01J3ZKZ0BRQ9SSJK1GRSCX4N4Z",
  "welcome"
);

searchResults.forEach((message) => {
  console.log(`${message.subject} - ${message.createdAt}`);
});
```

### Get a Message

```ts
const message = await sendook.inbox.message.get(
  "ibox_01J3ZKZ0BRQ9SSJK1GRSCX4N4Z",
  "msg_01J3ZN9SB2M5MHF5C2QBP4DT78"
);

console.log(`Subject: ${message.subject}`);
console.log(`Text: ${message.text}`);
console.log(`HTML: ${message.html}`);
console.log(`Labels: ${message.labels.join(", ")}`);
```

## Threads

Manage conversation threads.

### List Threads

```ts
const threads = await sendook.inbox.thread.list(
  "ibox_01J3ZKZ0BRQ9SSJK1GRSCX4N4Z"
);

threads.forEach((thread) => {
  console.log(`Thread: ${thread.subject}`);
  console.log(`  Messages: ${thread.messages.length}`);
});
```

### Get a Thread

```ts
const thread = await sendook.inbox.thread.get(
  "ibox_01J3ZKZ0BRQ9SSJK1GRSCX4N4Z",
  "thread_01J3ZQ12ES2WYX3X6J1S3MW8H2"
);

console.log(`Subject: ${thread.subject}`);
thread.messages.forEach((message, index) => {
  console.log(`Message ${index + 1}: ${message.subject}`);
});
```

## Webhooks

Configure webhooks to receive real-time notifications.

### Create a Webhook

```ts
const webhook = await sendook.webhook.create({
  url: "https://example.com/webhooks/sendook",
  events: [
    "message.received",
    "message.delivered",
    "message.bounced",
    "inbox.created",
  ],
});

console.log(`Webhook created: ${webhook.id}`);
```

### List Webhooks

```ts
const webhooks = await sendook.webhook.list();

webhooks.forEach((webhook) => {
  console.log(`${webhook.url} - Events: ${webhook.events.join(", ")}`);
});
```

### Get Webhook Details

```ts
const webhook = await sendook.webhook.get(
  "wh_01J3ZP8K9M2N3O4P5Q6R7S8T9U"
);

console.log(webhook);
```

### Test a Webhook

```ts
const result = await sendook.webhook.test(
  "wh_01J3ZP8K9M2N3O4P5Q6R7S8T9U"
);

if (result.success) {
  console.log("Webhook test successful!");
}
```

### Delete a Webhook

```ts
await sendook.webhook.delete("wh_01J3ZP8K9M2N3O4P5Q6R7S8T9U");
```

## Complete Example

Here's a complete example that demonstrates a typical workflow:

```ts
import Sendook from "@sendook/node";

const sendook = new Sendook(process.env.SENDOOK_API_KEY);

async function main() {
  // 1. Create an inbox
  const inbox = await sendook.inbox.create({
    name: "Support Bot",
  });
  console.log(`Created inbox: ${inbox.email}`);

  // 2. Send a welcome email
  const message = await sendook.inbox.message.send({
    inboxId: inbox.id,
    to: ["customer@example.com"],
    subject: "Welcome!",
    text: "Thank you for signing up!",
    html: "<h1>Welcome!</h1><p>Thank you for signing up!</p>",
  });
  console.log(`Sent message: ${message.id}`);

  // 3. List all messages
  const messages = await sendook.inbox.message.list(inbox.id);
  console.log(`Total messages: ${messages.length}`);

  // 4. Get a specific message
  const retrievedMessage = await sendook.inbox.message.get(
    inbox.id,
    message.id
  );
  console.log(`Retrieved: ${retrievedMessage.subject}`);

  // 5. List threads
  const threads = await sendook.inbox.thread.list(inbox.id);
  console.log(`Total threads: ${threads.length}`);
}

main().catch(console.error);
```

## Error Handling

The SDK uses axios under the hood, so errors follow axios error patterns:

```ts
try {
  const inbox = await sendook.inbox.get("invalid-id");
} catch (error) {
  if (error.response) {
    // API responded with error status
    console.error(`Status: ${error.response.status}`);
    console.error(`Data:`, error.response.data);
  } else if (error.request) {
    // Request made but no response received
    console.error("No response received");
  } else {
    // Error setting up request
    console.error("Error:", error.message);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions:

```ts
import Sendook from "@sendook/node";

const sendook = new Sendook(process.env.SENDOOK_API_KEY);

// TypeScript will provide autocomplete and type checking
const inbox = await sendook.inbox.create({
  name: "My Inbox", // ✅ TypeScript knows this is required
  email: "test@example.com", // ✅ TypeScript knows this is optional
});
```

## Development

To contribute or run tests locally:

```bash
# Install dependencies
bun install

# Run tests
bun test
```

## License

MIT

## Support

For API documentation, visit [https://sendook.com/docs](https://sendook.com/docs)

For issues and questions, please open an issue on GitHub.
