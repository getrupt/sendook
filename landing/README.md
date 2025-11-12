# Sendook Landing Page

> Marketing website and documentation for Sendook - Email infrastructure for AI agents

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)
[![Nuxt 3](https://img.shields.io/badge/Nuxt-3-00DC82?logo=nuxt&logoColor=white)](https://nuxt.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

This is the landing page and documentation site for Sendook, built with [Nuxt 3](https://nuxt.com) and [Nuxt UI](https://ui.nuxt.com).

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Bun, npm, or pnpm

### Setup

Install dependencies:

```bash
bun install
# or
npm install
# or
pnpm install
```

### Development Server

Start the development server on `http://localhost:3001`:

```bash
bun dev
# or
npm run dev
# or
pnpm dev
```

The site will be available at [http://localhost:3001](http://localhost:3001).

## 📁 Project Structure

```
landing/
├── app/
│   ├── components/      # Vue components
│   ├── layouts/         # Page layouts (default, auth, docs)
│   ├── pages/          # Route pages (index, pricing, blog, docs)
│   └── assets/         # CSS and static assets
├── content/            # Markdown and YAML content
│   ├── 0.index.yml     # Homepage content
│   ├── 1.docs/         # Documentation pages
│   ├── 2.pricing.yml   # Pricing page content
│   ├── 3.blog/         # Blog posts
│   └── 4.changelog/    # Changelog entries
├── public/             # Static files (favicon, images, etc.)
└── nuxt.config.ts      # Nuxt configuration
```

## ✏️ Editing Content

### Homepage

Edit `content/0.index.yml` to update:
- Hero section
- Feature sections
- Testimonials
- CTA

### Pricing

Edit `content/2.pricing.yml` to update:
- Pricing plans
- FAQ
- Logos

### Documentation

Add or edit Markdown files in `content/1.docs/`:

```markdown
---
title: Your Page Title
description: Page description for SEO
navigation:
  icon: i-lucide-icon-name
---

Your content here...
```

### Blog Posts

Add Markdown files in `content/3.blog/`:

```markdown
---
title: Blog Post Title
description: Post description
date: 2024-01-01
author: Your Name
---

Your blog content...
```

## 🎨 Customization

### Theme Colors

Edit `app/app.config.ts` to customize colors:

```typescript
export default defineAppConfig({
  ui: {
    primary: 'blue',
    gray: 'slate'
  }
})
```

### CSS Styles

Global styles are in `app/assets/css/main.css`.

### Components

Custom components are in `app/components/`. Nuxt UI components are auto-imported.

## 📦 Production

Build the application for production:

```bash
bun run build
# or
npm run build
# or
pnpm build
```

Preview the production build locally:

```bash
bun run preview
# or
npm run preview
# or
pnpm preview
```

## 🚢 Deployment

The landing page can be deployed to any static hosting provider:

### Vercel

```bash
vercel --prod
```

### Netlify

```bash
netlify deploy --prod
```

### Other Platforms

Build the static site and deploy the `.output/public` directory:

```bash
bun run generate
# Deploy the .output/public directory
```

Check out the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment) for platform-specific guides.

## 🔧 Tech Stack

- **[Nuxt 3](https://nuxt.com)** - Vue.js framework
- **[Nuxt UI](https://ui.nuxt.com)** - Component library
- **[Nuxt Content](https://content.nuxt.com)** - File-based CMS
- **[Tailwind CSS](https://tailwindcss.com)** - CSS framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

## 📖 Documentation

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Nuxt UI Documentation](https://ui.nuxt.com)
- [Nuxt Content Documentation](https://content.nuxt.com)

## 🤝 Contributing

Contributions to improve the landing page are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🔄 Renovate Integration

Install the [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) on your repository to automatically keep dependencies up to date.

## 📝 License

MIT License - see the [LICENSE](../LICENSE) file for details.
