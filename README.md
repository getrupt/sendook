# Sendook

**[sendook.com](https://sendook.com)** | **[npm package](https://www.npmjs.com/package/@sendook/node)**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![npm](https://img.shields.io/npm/v/@sendook/node.svg)](https://www.npmjs.com/package/@sendook/node)

## What is this?

The easiest way to start sending AND **receiving** emails at scale.

## Why this?

- Setting up email sending at scale is still cumbersome—we had to do it at [Rupt](https://www.rupt.dev){:target="_blank"}
- The ability to configure and check custom domains is still harder than it should be
- We use this extensively at [Rupt](https://www.rupt.dev){:target="_blank"} to have our internal agents handle inbound emails, payments, prioritizations, etc.

## Quick Start

### Using the API

```typescript
import { Sendook } from '@sendook/node-sdk';

// Initialize client with API key
const client = new Sendook({ apiKey: 'your_api_key' });

// Create an inbox
const inbox = await client.inboxes.create({
  name: 'support',
  email: 'support@sendook.com' // or use your custom domain
});

// Send an email
await client.messages.send({
  inboxId: inbox.id,
  from: 'support@sendook.com',
  to: ['customer@example.com'],
  subject: 'Welcome!',
  body: 'Thanks for signing up.'
});

// Receive emails via webhook
// Configure webhook endpoint to receive parsed emails as JSON
```

**Steps:**

1. Get client keys
2. Create inbox
   - If using `xxxxx@sendook.com`, no verification needed
   - If using a custom domain, DNS verifications required:
     - MX records (SES)
     - CNAME records (DKIM)
     - [Optional] SPF, DMARC
3. Start sending & receiving

### Self-hosting & Running Locally

#### API

```bash
# Using Docker
docker build -t sendook-api ./api
docker run -p 8006:8006 \
  -e MONGO_URI="your_mongodb_uri" \
  -e RUPT_SECRET_KEY="your_secret_key" \
  -e DEFAULT_EMAIL_DOMAIN="sendook.com" \
  -e AWS_ACCESS_KEY_ID="your_aws_key" \
  -e AWS_SECRET_ACCESS_KEY="your_aws_secret" \
  sendook-api
```

**Required environment variables:**
- `MONGO_URI`
- `RUPT_SECRET_KEY`
- `DEFAULT_EMAIL_DOMAIN`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

**Development:**

```bash
cd api
bun install
bun dev
```

**Production:**

```bash
bun install
bun start
```

#### App

```bash
cd app
bun install
bun dev  # Development
bun build && bun start  # Production
```

**Environment variable:**
- `API_URL` (default: `http://localhost:8006`)

#### Landing

```bash
cd landing
bun install
bun dev  # Development
bun run build && bun start  # Production
```

No environment variables required.

## Repository Structure

This monorepo contains:

- **`api/`** - Backend API server (Node.js + MongoDB)
- **`app/`** - Dashboard application
- **`landing/`** - Landing website (Nuxt 3 + Nuxt UI)
- **`node-sdk/`** - Official Node.js SDK

## Features

### Inboxes (`/inbox`)

- [x] Create inbox
  - [x] sendook.com domain
  - [x] Custom domain
- [x] List inboxes
- [x] Retrieve inbox
- [x] Delete inbox
  - [x] Deletes inbox and all messages

### Messages (`/messages`)

- [x] Send message
  - [x] To[], From, CC
    - [x] Labels
    - [x] Attachments
    - [ ] BCC
  - [x] Threads
  - [x] Replies
  - [ ] Rate-limit respecting (~1000/min & 50K/day)
- [x] Retrieve messages
  - [x] Attachments
- [x] Search (find messages within inbox)
  - [x] Query
    - [x] Regex
      - [x] To, From, CC, subject, body
    - [ ] Semantic search Vector DB (Chroma)

### Webhooks (`/webhooks`)

- [x] Create webhook
- [x] Execution
  - [x] Receive
    - [x] Parsed emails
  - [x] delivered, bounced, rejected, sent

### Threads (`/threads`)

- [x] Messages auto-create or use a thread
- [x] Retrieve threads

### Tests

- [x] Full API coverage

## SDKs

- [x] Node
- [ ] Python
- [ ] **Contributions welcome for additional SDKs**

## License

Sendook is open source software licensed under the [MIT license](./LICENSE).

---

Built with ❤️, maintained by the [Rupt](https://www.rupt.dev){:target="_blank"} team.