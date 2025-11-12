# Sendook

> Email infrastructure for AI agents

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

Stop wrestling with Gmail APIs and AWS SES setup. Sendook provides simple, powerful email infrastructure designed specifically for AI agents.

## 🚀 Quick Start

```bash
# Install the SDK
npm install @sendook/node-sdk

# Create an inbox and start sending emails
import { Sendook } from '@sendook/node-sdk';

const client = new Sendook({ apiKey: process.env.SENDOOK_API_KEY });

// Create an inbox
const inbox = await client.inboxes.create({
  name: 'My AI Agent'
});

// Send an email
await client.messages.send({
  inboxId: inbox.id,
  to: 'customer@example.com',
  subject: 'Hello from my AI agent',
  body: 'This is easy!'
});
```

## ✨ Why Sendook?

Traditional email setup for AI agents is painful:
- ❌ Days of DNS configuration (SPF, DKIM, DMARC)
- ❌ Complex Gmail OAuth flows or AWS SES setup
- ❌ Manual MIME parsing and attachment handling
- ❌ Polling for new emails
- ❌ Managing threads and conversations

Sendook eliminates all of this:
- ✅ Create inboxes via API in seconds
- ✅ Receive real-time webhooks for incoming emails
- ✅ Pre-decoded JSON responses, ready for consumption
- ✅ Automatic thread management
- ✅ Built-in search and storage
- ✅ Open source (MIT license)

## 🏗️ Repository Structure

This monorepo contains:

- **`api/`** - Backend API server (Node.js + MongoDB)
- **`landing/`** - Marketing website (Nuxt 3 + Nuxt UI)
- **`node-sdk/`** - Official Node.js SDK

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- Bun or npm
- MongoDB 5.0+
- Docker (optional, for containerized development)

### Local Development

1. **Clone the repository**

```bash
git clone https://github.com/sendook/sendook.git
cd sendook
```

2. **Install dependencies**

```bash
# Install dependencies for all packages
npm install
```

3. **Set up environment variables**

```bash
# API
cd api
cp .env.example .env
# Edit .env with your MongoDB connection string and other settings

# Landing page
cd ../landing
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB**

```bash
# Using Docker
docker run -d -p 27017:27017 --name sendook-mongo mongo:5.0

# Or use your local MongoDB installation
```

5. **Start the API server**

```bash
cd api
bun dev
# API runs on http://localhost:3000
```

6. **Start the landing page**

```bash
cd landing
bun dev
# Landing page runs on http://localhost:3001
```

## 🐳 Docker Setup

Run the entire stack with Docker Compose:

```bash
docker-compose up -d
```

This starts:
- API server on port 3000
- Landing page on port 3001
- MongoDB on port 27017

## 📖 Documentation

- **[Getting Started](./landing/content/1.docs/1.getting-started/1.index.md)** - Introduction and setup
- **[Installation](./landing/content/1.docs/1.getting-started/2.installation.md)** - Detailed installation guide
- **[Usage Guide](./landing/content/1.docs/1.getting-started/3.usage.md)** - Core workflows and examples
- **[API Documentation](./api/README.md)** - Complete API reference
- **[SDK Documentation](./node-sdk/README.md)** - Node.js SDK reference

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run API tests
cd api && bun test

# Run SDK tests
cd node-sdk && bun test
```

## 🚢 Deployment

### Cloud Hosting (Recommended for Production)

Deploy to your preferred platform:

- **Vercel/Netlify** - Landing page
- **Railway/Render/Fly.io** - API server
- **MongoDB Atlas** - Database

### Self-Hosting

See the [Installation Guide](./landing/content/1.docs/1.getting-started/2.installation.md#self-hosted-setup) for complete self-hosting instructions.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

Sendook is open source software licensed under the [MIT license](./LICENSE).

## 🌟 Support

- 📚 [Documentation](https://sendook.com/docs)
- 💬 [Discord Community](https://discord.gg/sendook)
- 🐛 [Issue Tracker](https://github.com/sendook/sendook/issues)
- 📧 [Email Support](mailto:support@sendook.com)

## 🗺️ Roadmap

- [x] Core email infrastructure
- [x] Webhook notifications
- [x] Multi-inbox support
- [x] Node.js SDK
- [ ] Python SDK
- [ ] Go SDK
- [ ] Advanced analytics
- [ ] Email templates
- [ ] A/B testing
- [ ] Email tracking (opens, clicks)

---

Built with ❤️ for AI agents that need to communicate