# Sendook

![Sendook](https://www.sendook.com/sendook-logo.svg)

**[sendook.com](https://sendook.com)** | **[npm package](https://www.npmjs.com/package/@sendook/node)**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![npm](https://img.shields.io/npm/v/@sendook/node.svg)](https://www.npmjs.com/package/@sendook/node)

## What is this?

The easiest way to start sending AND **receiving** emails at scale.

## Why this?

- Setting up email sending at scale is still cumbersome—we had to do it at <a href="https://www.rupt.dev" target="_blank">Rupt</a>
- The ability to configure and check custom domains is still harder than it should be
- We use this extensively at <a href="https://www.rupt.dev" target="_blank">Rupt</a> to have our internal agents handle inbound emails, payments, prioritizations, etc.

## Quick Start

### Using the API

#### Using the API endpoints

```curl
curl -X POST https://api.sendook.com/v1/inboxes \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "rupt",
    "email": "rupt@sendook.com"
  }'

curl -X POST https://api.sendook.com/v1/inboxes/{inbox_id}/send \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "to": ["rupt@sendook.com"],
    "subject": "Welcome!",
    "text": "Thanks for signing up.",
    "html": "<p>Thanks for signing up.</p>",
  }'

curl -X POST https://api.sendook.com/v1/webhooks \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/email",
    "events": ["message.received"],
  }'
```

#### Using the TypeScript SDK

```typescript
import { Sendook } from "@sendook/node";

// Initialize client with API key
const client = new Sendook({ apiKey: "your_api_key" });

// Create an inbox
const inbox = await client.inboxes.create({
  name: "rupt",
  email: "rupt@sendook.com", // or use your custom domain
});

// Send an email
await client.messages.send({
  inboxId: inbox.id,
  from: "rupt@sendook.com",
  to: ["rupt@sendook.com"],
  subject: "Welcome!",
  text: "Thanks for signing up.",
  html: "<p>Thanks for signing up.</p>",
});

// Receive emails via webhook
await client.webhook.create({
  url: "https://your-app.com/webhooks/email",
  events: ["message.received"],
});
```

**Steps:**

1. Get client keys
2. Create inbox
   - If using `xxxxx@sendook.com`, no verification needed
   - If using a custom domain, DNS verifications required:
     - MX records (SES)
     - CNAME records (DKIM)
     - [Optional] SPF, DMARC
3. Start sending **& receiving** emails

### Self-hosting & Running Locally

#### API

```bash
# Using Docker
docker build -t sendook-api ./api
docker run -p 8006:8006 \
  -e MONGO_URI="your_mongodb_uri" \
  # optional Rupt secret key for fake accounts & account takeover
  -e RUPT_SECRET_KEY="your_secret_key" \
  -e DEFAULT_EMAIL_DOMAIN="sendook.com" \
  -e AWS_ACCESS_KEY_ID="your_aws_key" \
  -e AWS_SECRET_ACCESS_KEY="your_aws_secret" \
  sendook-api
```

**Environment variables:**

- `MONGO_URI`
- `RUPT_SECRET_KEY` (optional for fake accounts & account takeover)
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

### Domains (`/domains`)

- [x] Create domain
- [x] List domains
- [x] Retrieve domain
- [x] Delete domain
- [x] Verify domain
- [x] Get domain DNS records

### Tests

- [x] Full API coverage

## SDKs

- [x] Node
- [ ] Python
- [ ] **Contributions welcome for additional SDKs**

## License

Sendook is open source software licensed under the [MIT license](./LICENSE).

---

Built with ❤️, maintained by the <a href="https://www.rupt.dev" target="_blank">Rupt</a> team.
